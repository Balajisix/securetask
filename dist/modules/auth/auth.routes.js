import { Router } from "express";
import { authController } from "./auth.controller.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { validateRequest } from "../../common/middleware/validate-request.js";
import { authenticate } from "../../common/middleware/authenticate.js";
const router = Router();
router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
export default router;
//# sourceMappingURL=auth.routes.js.map