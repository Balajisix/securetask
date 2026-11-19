import type { RequestHandler, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
interface ValidationDetails {
    field: string;
    message: string;
}
export declare class ValidationError extends AppError {
    constructor(details: ValidationDetails[]);
}
export declare const validateRequest: <T>(schema: z.ZodType<T>) => RequestHandler;
export declare const getValidatedData: <T>(res: Response) => T;
export {};
