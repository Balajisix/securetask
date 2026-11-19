import { healthService } from "./health.service.js";
import { AppError } from "../../common/errors/app-error.js";
import { sendSuccess } from "../../common/utils/api-response.js";
export const getLiveness = (_req, res) => {
    return sendSuccess(res, 200, "Service is alive", {
        status: "ok"
    });
};
export const getReadiness = async (_req, res) => {
    const databaseHealthy = await healthService.checkDB();
    if (!databaseHealthy) {
        throw new AppError("Database is currently unreachable", 503, "DATABASE_UNAVAILABLE");
    }
    return sendSuccess(res, 200, "Service is ready", {
        status: "ready",
        dependencies: {
            database: "connected"
        },
    });
};
//# sourceMappingURL=health.controller.js.map