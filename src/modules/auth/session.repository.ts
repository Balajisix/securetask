
import { prisma } from "../../lib/prisma.js";

export interface CreateSessionInput {
    userId: string;
    ipAddress: string | null;
    userAgent: string | null;
    sessionExpiresAt: Date;
    tokenHash: string;
    tokenExpiresAt: Date;
}

export interface RotateRefreshTokenIp {
    currentTokenHash: string;
    newTokenHash: string;
    now: Date;
    refreshTokenTtlMs: number;
}

export type RotateTokenResult =
    | {
        status: "rotated";
        userId: string;
        sessionId: string;
        tokenExpiresAt: Date;
    }
    | {
        status: "invalid";
    }
    | {
        status: "reused";
        sessionId: string;
    };

export const sessionRepository = {
    async create(input: CreateSessionInput) {
        return prisma.session.create({
            data: {
                userId: input.userId,
                ipAddress: input.ipAddress,
                userAgent: input.userAgent,
                expiresAt: input.sessionExpiresAt,
                refreshTokens: {
                    create: {
                        tokenHash: input.tokenHash,
                        expiresAt: input.tokenExpiresAt,
                    },
                },
            },

            select: {
                id: true,
            },
        });
    },

    async rotateRefreshToken(input: RotateRefreshTokenIp): Promise<RotateTokenResult> {
        return prisma.$transaction(async (tx) => {
            // 1. Find existing refresh token.
            const currentToken =
                await tx.refreshToken.findUnique({
                    where: {
                        tokenHash: input.currentTokenHash,
                    },
                    include: {
                        session: true,
                    },
                });

            // Token doesn't exist.
            if (!currentToken) {
                return {
                    status: "invalid",
                };
            }

            // 2. Detect previously-used token reuse.
            if (currentToken.usedAt !== null) {
                // Reuse detected.
                // Revoke the entire session family.
                await tx.session.updateMany({
                    where: {
                        id: currentToken.sessionId,
                        revokedAt: null,
                    },
                    data: {
                        revokedAt: input.now,
                    },
                });

                await tx.refreshToken.updateMany({

                    where: {
                        sessionId: currentToken.sessionId,
                        revokedAt: null,
                    },
                    data: {
                        revokedAt: input.now,
                    },
                });

                return {
                    status: "reused",
                    sessionId: currentToken.sessionId,
                };
            }

            // 3. Check token and session validity.
            const session = currentToken.session;

            const sessionInvalid =
                session.revokedAt !== null ||
                session.expiresAt <= input.now;

            const tokenInvalid =
                currentToken.revokedAt !== null ||
                currentToken.expiresAt <= input.now;

            if (sessionInvalid || tokenInvalid) {
                // An expired token should not leave
                // a refreshable session behind.
                if (!session.revokedAt && (
                    session.expiresAt <= input.now ||
                    currentToken.expiresAt <= input.now
                )) {

                    await tx.session.updateMany({
                        where: {
                            id: session.id,
                            revokedAt: null,
                        },
                        data: {
                            revokedAt: input.now,
                        },
                    });

                    await tx.refreshToken.updateMany({
                        where: {
                            sessionId: session.id,
                            revokedAt: null,
                        },
                        data: {
                            revokedAt: input.now,
                        },
                    });
                }
                return {
                    status: "invalid",
                };
            }

            // 4. Atomically confirm that the session
            // is still active.
            const activeSession =
                await tx.session.updateMany({
                    where: {
                        id: session.id,
                        userId: session.userId,
                        revokedAt: null,
                        expiresAt: {
                            gt: input.now,
                        },
                    },
                    data: {
                        lastSeenAt: input.now,
                    },
                });
            if (activeSession.count !== 1) {
                return {
                    status: "invalid",
                };
            }

            // 5. Atomically consume the existing token.
            //
            // Two concurrent requests may both initially
            // read this token as unused.
            //
            // Only one request can successfully consume it.
            const consumed =
                await tx.refreshToken.updateMany({
                    where: {
                        id: currentToken.id,
                        usedAt: null,
                        revokedAt: null,
                        expiresAt: {
                            gt: input.now,
                        },
                    },
                    data: {
                        usedAt: input.now,
                    },
                });
            if (consumed.count !== 1) {
                // Another request already consumed this token.
                // Treat it as a replay and revoke the session.
                await tx.session.updateMany({
                    where: {
                        id: session.id,
                        revokedAt: null,
                    },
                    data: {
                        revokedAt: input.now,
                    },
                });

                await tx.refreshToken.updateMany({
                    where: {
                        sessionId: session.id,
                        revokedAt: null,
                    },
                    data: {
                        revokedAt: input.now,
                    },
                });
                return {
                    status: "reused",
                    sessionId: session.id,
                };
            }

            // 6. Calculate the new refresh token expiration.
            //
            // Never extend beyond the absolute session limit.
            const idleExpiration = new Date(
                input.now.getTime() + input.refreshTokenTtlMs
            );

            const tokenExpiresAt =
                idleExpiration < session.expiresAt
                    ? idleExpiration
                    : session.expiresAt;

            // 7. Create the replacement refresh token.
            await tx.refreshToken.create({
                data: {
                    sessionId: session.id,
                    tokenHash: input.newTokenHash,
                    expiresAt: tokenExpiresAt,
                },
            });

            // 8. Return the information needed
            // to issue a fresh access token.
            return {
                status: "rotated",
                userId: session.userId,
                sessionId: session.id,
                tokenExpiresAt,
            };
        });
    },

    async revokeByRefreshToken(tokenHash: string): Promise<void> {
        await prisma.$transaction(async (tx) => {
            const token = await tx.refreshToken.findUnique({
                where: {
                    tokenHash,
                },
                select: {
                    sessionId: true,
                },
            });

            if (!token) {
                return;
            }
            const now = new Date();
            await tx.session.updateMany({
                where: {
                    id: token.sessionId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            });

            await tx.refreshToken.updateMany({
                where: {
                    sessionId: token.sessionId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            });
        });
    },

    async revokeAllForUser(userId: string): Promise<number> {
        return prisma.$transaction(async (tx) => {
            const sessions = await tx.session.findMany({
                where: {
                    userId,
                },
                select: {
                    id: true,
                },
            });

            const sessionIds = sessions.map(
                (session) => session.id
            );
            if (sessionIds.length === 0) {
                return 0;
            }

            const now = new Date();
            const revoked = await tx.session.updateMany({
                where: {
                    id: {
                        in: sessionIds,
                    },
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            });
            await tx.refreshToken.updateMany({
                where: {
                    sessionId: {
                        in: sessionIds,
                    },
                    revokedAt: null,
                },
                data: {
                    revokedAt: now,
                },
            });
            return revoked.count;
        });
    },

    async isActive(
        sessionId: string,
        userId: string,
    ): Promise<boolean> {
        const session = await prisma.session.findFirst({
            where: {
                id: sessionId,
                userId,
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
            select: {
                id: true,
            },
        });
        return session !== null;
    },
};
