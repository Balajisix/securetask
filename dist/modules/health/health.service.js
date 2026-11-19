import { prisma } from "../../lib/prisma.js";
import { logger } from "../../lib/logger.js";
export const healthService = {
    async checkDB() {
        try {
            await prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            logger.error({ err: error }, "Database health check failed");
            return false;
        }
    }
};
//# sourceMappingURL=health.service.js.map