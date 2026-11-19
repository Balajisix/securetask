import type {RequestHandler, Request, Response, NextFunction} from "express"
import {AppError} from "../errors/app-error.js";

export const notFoundHandler: RequestHandler = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    next(
        new AppError(
            `Route ${req.method} ${req.path} was not found`,
            404,
            "ROUTE_NOT_FOUND"
        )
    )
}