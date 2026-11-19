import { Prisma } from "../../generated/prisma/client.js";
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import { logger } from "../../lib/logger.js";
const isMalformedJson = (error) => {
    return (error instanceof SyntaxError &&
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        error.status === 400 &&
        "type" in error &&
        error.type === "entity.parse.failed");
};
const normalizeError = (error) => {
    if (error instanceof AppError) {
        return error;
    }
    if (error instanceof z.ZodError) {
        const details = error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
        }));
        return new AppError("Request Validation Failed", 400, "VALIDATION_ERROR", details);
    }
    if (isMalformedJson(error)) {
        return new AppError("Invalid JSON request body", 400, "INVALID_JSON");
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return new AppError("A record with these details already exists", 409, "RESOURCE_CONFLICT", undefined, { cause: error });
            case "P2003":
                return new AppError("The operation references an invalid related record", 409, "RELATIONSHIP_CONFLICT", undefined, { cause: error });
            case "P2025":
                return new AppError("The requested record was not found", 404, "RESOURCE_NOT_FOUND", undefined, { cause: error });
            case "P2024":
                return new AppError("Database is temporarily unavailable", 503, "DATABASE_UNAVAILABLE", undefined, { cause: error });
            default:
                return new AppError("A database operation failed", 500, "DATABASE_ERROR", undefined, { cause: error });
        }
    }
    return new AppError("An unexpected error occurred", 500, "INTERNAL_SERVER_ERROR", undefined, { cause: error });
};
export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    const appError = normalizeError(error);
    const statusCode = appError.statusCode;
    const requestIdHeader = res.getHeader("X-Request-Id");
    const requestId = typeof requestIdHeader === "string" ? requestIdHeader : null;
    if (statusCode >= 500) {
        logger.error({
            err: error,
            requestId,
            method: req.method,
            path: req.path,
            errorCode: appError.code,
        }, "Request failed with an internal server error");
    }
    else {
        logger.warn({
            requestId,
            method: req.method,
            path: req.path,
            statusCode,
            errorCode: appError.code,
        }, "Request rejected with a client error");
    }
    const response = {
        success: false,
        error: {
            code: appError.code,
            message: statusCode >= 500 ? "An unexpected error occurred" : appError.message,
            ...(statusCode < 500 && appError.details !== undefined ? { details: appError.details } : {})
        },
        requestId
    };
    return res.status(statusCode).json(response);
};
//# sourceMappingURL=error-handler.js.map