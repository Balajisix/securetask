import { authService } from "./auth.services.js";
import { AppError } from "../../common/errors/app-error.js";
import { getValidatedData } from "../../common/middleware/validate-request.js";
import { sendSuccess } from "../../common/utils/api-response.js";
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } from "./auth.cookie.js";
const register = async (_req, res) => {
    const { body } = getValidatedData(res);
    const user = await authService.register(body);
    return sendSuccess(res, 201, "Registration successful", {
        user,
    });
};
const login = async (req, res) => {
    const { body } = getValidatedData(res);
    const result = await authService.login(body, {
        ipAddress: req.ip ?? null,
        userAgent: req.get("user-agent") ?? null,
    });
    setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    return sendSuccess(res, 200, "Login successful", {
        user: result.user,
        accessToken: result.accessToken,
        tokenType: "Bearer",
        expiresIn: result.expiresIn
    });
};
const refresh = async (req, res) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (typeof refreshToken !== "string") {
        clearRefreshCookie(res);
        throw new AppError("Refresh token is missing", 401, "INVALID_REFRESH_TOKEN");
    }
    try {
        const result = await authService.refresh(refreshToken);
        setRefreshCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
        return sendSuccess(res, 200, "Token refreshed successfully", {
            accessToken: result.accessToken,
            tokenType: "Bearer",
            expiresIn: result.expiresIn,
        });
    }
    catch (error) {
        if (error instanceof AppError &&
            error.statusCode === 401) {
            clearRefreshCookie(res);
        }
        throw error;
    }
};
const logout = async (req, res) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(typeof refreshToken === "string"
        ? refreshToken
        : undefined);
    clearRefreshCookie(res);
    return sendSuccess(res, 200, "Logged out successfully", {
        loggedOut: true,
    });
};
const logoutAll = async (req, res) => {
    const userId = req.auth?.userId;
    if (!userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }
    const revokedCount = await authService.logoutAll(userId);
    clearRefreshCookie(res);
    return sendSuccess(res, 200, "All sessions logged out successfully", {
        sessionRevoked: revokedCount
    });
};
export const authController = {
    register,
    login,
    refresh,
    logout,
    logoutAll
};
//# sourceMappingURL=auth.controller.js.map