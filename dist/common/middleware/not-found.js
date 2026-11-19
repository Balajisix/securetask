import { AppError } from "../errors/app-error.js";
export const notFoundHandler = (req, _res, next) => {
    next(new AppError(`Route ${req.method} ${req.path} was not found`, 404, "ROUTE_NOT_FOUND"));
};
//# sourceMappingURL=not-found.js.map