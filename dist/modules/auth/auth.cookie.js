import { env } from "../../config/env.js";
export const REFRESH_COOKIE_NAME = "refresh_token";
const refreshCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api/v1/auth",
};
export const setRefreshCookie = (res, token, expiresAt) => {
    res.cookie(REFRESH_COOKIE_NAME, token, {
        ...refreshCookieOptions,
        expires: expiresAt,
    });
};
export const clearRefreshCookie = (res) => {
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
};
//# sourceMappingURL=auth.cookie.js.map