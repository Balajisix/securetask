import type {Request, Response, RequestHandler, NextFunction} from "express"
import { authService } from "./auth.services.js"
import { env } from "../../config/env.js"
import { AppError } from "../../common/errors/app-error.js"
import { getValidatedData } from "../../common/middleware/validate-request.js"
import { sendSuccess } from "../../common/utils/api-response.js"
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } from "./auth.cookie.js"
import type { RegisterRequest, LoginRequest } from "./auth.validation.js"

const register: RequestHandler = async(
    _req: Request,
    res: Response,
) => {
    const {body} = getValidatedData<RegisterRequest>(res);
    const user = await authService.register(body);

    return sendSuccess(
        res,
        201,
        "Registration successful",
        {
            user,
        }
    );
};

const login: RequestHandler = async(
    req: Request,
    res: Response,
) => {
    const {body} = getValidatedData<LoginRequest>(res);
    const result = await authService.login(
        body,
        {
            ipAddress: req.ip ?? null,
            userAgent: req.get("user-agent") ?? null,
        }
    );

    setRefreshCookie(
        res,
        result.refreshToken,
        result.refreshTokenExpiresAt
    );

    return sendSuccess(
        res,
        200,
        "Login successful",
        {
            user: result.user,
            accessToken: result.accessToken,
            tokenType: "Bearer",
            expiresIn: result.expiresIn
        }
    );
};

const refresh: RequestHandler = async (
    req: Request,
    res: Response,
) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if(typeof refreshToken !== "string"){
        clearRefreshCookie(res);
        throw new AppError(
            "Refresh token is missing",
            401,
            "INVALID_REFRESH_TOKEN"
        );
    }

    try {
        const result = await authService.refresh(
            refreshToken
        )
        setRefreshCookie(
            res,
            result.refreshToken,
            result.refreshTokenExpiresAt
        );

        return sendSuccess(
            res,
            200,
            "Token refreshed successfully",
            {
                accessToken: result.accessToken,
                tokenType: "Bearer",
                expiresIn: result.expiresIn,
            }
        )
    } catch(error) {
        if(
            error instanceof AppError &&
            error.statusCode === 401
        ) {
            clearRefreshCookie(res);
        }

        throw error;
    }
}

const logout: RequestHandler = async(
    req: Request,
    res: Response
) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    await authService.logout(
        typeof refreshToken === "string"
            ? refreshToken
            : undefined
    );
    clearRefreshCookie(res);

    return sendSuccess(
        res,
        200,
        "Logged out successfully",
        {
            loggedOut: true,
        }
    );
};

const logoutAll: RequestHandler = async(
    req: Request,
    res: Response,
) => {
    const userId = req.auth?.userId;
    if(!userId){
        throw new AppError(
            "Authentication required",
            401,
            "UNAUTHORIZED"
        );
    }

    const revokedCount = await authService.logoutAll(userId);
    clearRefreshCookie(res);

    return sendSuccess(
        res,
        200,
        "All sessions logged out successfully",
        {
            sessionRevoked: revokedCount
        }
    );
};

export const authController = {
    register,
    login,
    refresh,
    logout,
    logoutAll
};