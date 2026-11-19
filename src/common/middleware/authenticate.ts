import type { RequestHandler, Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { verifyAccessToken } from "../../modules/auth/token.service.js";
import { sessionRepository } from "../../modules/auth/session.repository.js";

export const authenticate: RequestHandler = async(
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    const authorization = req.get("authorization");

    if(!authorization){
        return next(
            new AppError(
                "Authentication required",
                401,
                "UNAUTHORIZED"
            )
        );
    }

    const match = authorization.match(
        /^Bearer\s+(.+)$/i
    );
    if(!match){
        return next(
            new AppError(
                "Invalid authorization header",
                401,
                "UNAUTHORIZED"
            )
        )
    }

    const accessToken = match[1];
    if(!accessToken){
        return next(
            new AppError(
                "Invalid access token",
                401,
                "UNAUTHORIZED"
            )
        )
    }

    let claims;
    try{
        claims = await verifyAccessToken(accessToken)
    } catch {
        return next(
            new AppError(
                "Invalid or expired access token",
                401,
                "UNAUTHORIZED"
            )
        )
    }

    const sessionActive = 
        await sessionRepository.isActive(
            claims.sessionId,
            claims.userId
        );
    if(!sessionActive){
        return next(
            new AppError(
                "Session is expired or revoked",
                401,
                "SESSION_INVALID"
            )
        );
    }

    req.auth = {
        userId: claims.userId,
        sessionId: claims.sessionId,
    };

    return next();
}