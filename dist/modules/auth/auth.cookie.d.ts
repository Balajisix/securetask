import type { Response } from "express";
export declare const REFRESH_COOKIE_NAME = "refresh_token";
export declare const setRefreshCookie: (res: Response, token: string, expiresAt: Date) => void;
export declare const clearRefreshCookie: (res: Response) => void;
