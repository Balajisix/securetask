import type { Response } from "express";
export declare const sendSuccess: <T>(res: Response, statusCode: number, message: string, data: T) => Response<any, Record<string, any>>;
