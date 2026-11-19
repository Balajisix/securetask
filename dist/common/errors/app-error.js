export class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details, options) {
        super(message, options);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;
        if (details !== undefined) {
            this.details = details;
        }
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=app-error.js.map