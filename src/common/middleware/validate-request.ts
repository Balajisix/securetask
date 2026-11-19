import type {RequestHandler, Response, Request, NextFunction} from 'express';
import {z} from 'zod';
import {AppError} from '../errors/app-error.js';

interface ValidationDetails {
    field: string;
    message: string;
}

export class ValidationError extends AppError {
    constructor(details: ValidationDetails[]) {
        super(
            "Request Validation Failed",
            400,
            "VALIDATION_ERROR",
            details
        )
    }
} 

export const validateRequest = <T>(
    schema: z.ZodType<T>,
): RequestHandler => {
    return(req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query
        });

        if(!result.success){
            const details = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }));

            return next(new ValidationError(details));
        }

        res.locals.validated = result.data;

        return next();
    }
}

export const getValidatedData = <T>(
    res: Response,
): T => {
    return res.locals.validated as T;
}