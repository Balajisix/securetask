import type { Response } from "express";

import type { ApiSuccessResponse } from "../types/api-response.js";

export const sendSuccess = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data: T,
) => {
    const requestId = res.getHeader("X-Request-Id");

    const response: ApiSuccessResponse<T> = {
        success: true,
        message,
        data,
        requestId:
            typeof requestId === "string"
                ? requestId
                : null,
    };

    return res.status(statusCode).json(response);
};