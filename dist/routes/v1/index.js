import { Router } from "express";
import healthRouter from "../../modules/health/health.route.js";
import authRoutes from "../../modules/auth/auth.routes.js";
import { sendSuccess } from "../../common/utils/api-response.js";
const router = Router();
router.get("/", (_req, res) => {
    return sendSuccess(res, 200, "SecureTask API v1", {
        version: "v1",
        status: "active"
    });
});
router.use("/health", healthRouter);
router.use("/auth", authRoutes);
export default router;
//# sourceMappingURL=index.js.map