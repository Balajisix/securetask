import express from "express";
import helmet from "helmet";
import { httpLogger } from "./lib/logger.js";
import v1Routes from "./routes/v1/index.js";
import healthRoutes from "./modules/health/health.route.js";
import { notFoundHandler } from "./common/middleware/not-found.js";
import { errorHandler } from "./common/middleware/error-handler.js";
import cookieParser from "cookie-parser";
const app = express();
app.disable("x-powered-by");
// Global Middleware
app.use(httpLogger);
// Security Header
app.use(helmet());
app.use(express.json({
    limit: "10kb",
}));
app.use(express.urlencoded({
    extended: false,
    limit: "10kb"
}));
app.use(cookieParser());
app.use("/health", healthRoutes);
app.use("/api/v1", v1Routes);
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map