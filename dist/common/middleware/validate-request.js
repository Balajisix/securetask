import { AppError } from '../errors/app-error.js';
export class ValidationError extends AppError {
    constructor(details) {
        super("Request Validation Failed", 400, "VALIDATION_ERROR", details);
    }
}
export const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query
        });
        if (!result.success) {
            const details = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }));
            return next(new ValidationError(details));
        }
        res.locals.validated = result.data;
        return next();
    };
};
export const getValidatedData = (res) => {
    return res.locals.validated;
};
//# sourceMappingURL=validate-request.js.map