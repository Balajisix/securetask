import type { Response } from "express";
import { env } from "../../config/env.js";

export const REFRESH_COOKIE_NAME = "refresh_token";

const refreshCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api/v1/auth",
}

export const setRefreshCookie = (
    res: Response,
    token: string,
    expiresAt: Date,
): void => {
    res.cookie(
        REFRESH_COOKIE_NAME,
        token,
        {
            ...refreshCookieOptions,
            expires: expiresAt,
        }
    );
};

export const clearRefreshCookie = (
    res: Response,
): void => {
    res.clearCookie(
        REFRESH_COOKIE_NAME,
        refreshCookieOptions
    );
};