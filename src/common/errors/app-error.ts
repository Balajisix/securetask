export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: unknown;

    constructor(
        message: string,
        statusCode = 500,
        code = 'INTERNAL_SERVER_ERROR',
        details?: unknown,
        options?: ErrorOptions
    ) {
        super(message, options);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;

        if(details !== undefined) {
            this.details = details;
        }

        Object.setPrototypeOf(this, new.target.prototype);
    }
}