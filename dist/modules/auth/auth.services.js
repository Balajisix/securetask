import { Prisma } from "../../generated/prisma/client.js";
import { env } from "../../config/env.js";
import { AppError } from "../../common/errors/app-error.js";
import { logger } from "../../lib/logger.js";
import { userRepository } from "./user.repository.js";
import { sessionRepository } from "./session.repository.js";
import { hashPassword, verifyPasswordLogin } from "./password.service.js";
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "./token.service.js";
export const authService = {
    async register(input) {
        const email = input.email.trim().toLowerCase();
        const passwordHash = await hashPassword(input.password);
        try {
            const user = await userRepository.createWithDefaultRole({
                email,
                passwordHash,
                ...(input.firstName && { firstName: input.firstName }),
                ...(input.lastName && { lastName: input.lastName })
            });
            logger.info("User Created");
            return user;
        }
        catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new AppError("An account with this email already exists", 409, "EMAIL_ALREADY_EXISTS");
            }
            throw error;
        }
    },
    async login(input, metadata) {
        const email = input.email.trim().toLowerCase();
        const user = await userRepository.findByEmail(email);
        const passwordValid = await verifyPasswordLogin(user?.passwordHash ?? null, input.password);
        if (!user ||
            !passwordValid ||
            !user.isActive) {
            throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }
        const now = new Date();
        const sessionExpiresAt = new Date(now.getTime() +
            env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
        const refreshToken = generateRefreshToken();
        const refreshTokenExpiresAt = new Date(Math.min(now.getTime() +
            env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000, sessionExpiresAt.getTime()));
        const refreshTokenHash = hashRefreshToken(refreshToken);
        const session = await sessionRepository.create({
            userId: user.id,
            ipAddress: metadata.userAgent,
            userAgent: metadata.userAgent,
            sessionExpiresAt,
            tokenHash: refreshTokenHash,
            tokenExpiresAt: refreshTokenExpiresAt
        });
        const accessToken = await generateAccessToken(user.id, session.id);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            accessToken,
            refreshToken,
            refreshTokenExpiresAt,
            expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
        };
    },
    async refresh(rawRefreshToken) {
        const now = new Date();
        const newRefreshToken = generateRefreshToken();
        const currentTokenHash = hashRefreshToken(rawRefreshToken);
        const newTokenHash = hashRefreshToken(newRefreshToken);
        const rotation = await sessionRepository.rotateRefreshToken({
            currentTokenHash,
            newTokenHash,
            now,
            refreshTokenTtlMs: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
        });
        if (rotation.status === "invalid") {
            throw new AppError("Refresh token is invalid or expired", 401, "INVALID_REFRESH_TOKEN");
        }
        if (rotation.status === "reused") {
            logger.warn({
                sessionId: rotation.sessionId,
            }, "Refresh token reuse detected");
            throw new AppError("Refresh token is invalid or expired", 401, "INVALID_REFRESH_TOKEN");
        }
        const accessToken = await generateAccessToken(rotation.userId, rotation.sessionId);
        return {
            accessToken,
            refreshToken: newRefreshToken,
            refreshTokenExpiresAt: rotation.tokenExpiresAt,
            expiresIn: env.ACCESS_TOKEN_TTL_SECONDS
        };
    },
    async logout(rawRefreshToken) {
        if (!rawRefreshToken) {
            return;
        }
        const tokenHash = hashRefreshToken(rawRefreshToken);
        await sessionRepository.revokeByRefreshToken(tokenHash);
    },
    async logoutAll(userId) {
        return sessionRepository.revokeAllForUser(userId);
    },
};
//# sourceMappingURL=auth.services.js.map