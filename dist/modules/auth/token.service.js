import { SignJWT, jwtVerify } from "jose";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { env } from "../../config/env.js";
const jwtSecret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);
export const generateAccessToken = async (userId, sessionId) => {
    const token = await new SignJWT({
        sid: sessionId,
        token_use: "access",
    }).setProtectedHeader({
        alg: "HS256",
        typ: "JWT"
    }).setSubject(userId).setIssuer(env.JWT_ISSUER).setAudience(env.JWT_AUDIENCE).setIssuedAt()
        .setExpirationTime(`${env.ACCESS_TOKEN_TTL_SECONDS}s`).setJti(randomUUID())
        .sign(jwtSecret);
    return token;
};
export const verifyAccessToken = async (token) => {
    const { payload } = await jwtVerify(token, jwtSecret, {
        algorithms: ["HS256"],
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
        maxTokenAge: `${env.ACCESS_TOKEN_TTL_SECONDS}s`
    });
    if (typeof payload.sub !== "string" ||
        typeof payload.sid !== "string" ||
        payload.token_use !== "access") {
        throw new Error("Invalid access token calims");
    }
    return {
        userId: payload.sub,
        sessionId: payload.sid
    };
};
export const generateRefreshToken = () => {
    return randomBytes(48).toString("base64url");
};
export const hashRefreshToken = (token) => {
    return createHash("sha256").update(token, "utf8").digest("hex");
};
//# sourceMappingURL=token.service.js.map