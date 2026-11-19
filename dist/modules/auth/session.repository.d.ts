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
export type RotateTokenResult = {
    status: "rotated";
    userId: string;
    sessionId: string;
    tokenExpiresAt: Date;
} | {
    status: "invalid";
} | {
    status: "reused";
    sessionId: string;
};
export declare const sessionRepository: {
    create(input: CreateSessionInput): Promise<{
        id: string;
    }>;
    rotateRefreshToken(input: RotateRefreshTokenIp): Promise<RotateTokenResult>;
    revokeByRefreshToken(tokenHash: string): Promise<void>;
    revokeAllForUser(userId: string): Promise<number>;
    isActive(sessionId: string, userId: string): Promise<boolean>;
};
