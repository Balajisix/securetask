import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { logger } from "./lib/logger.js";
const configureGracefulShutdown = (server) => {
    let isShuttingDown = false;
    const shutdown = (signal) => {
        if (isShuttingDown) {
            return;
        }
        isShuttingDown = true;
        logger.info({ signal }, "Graceful shutdown initiated");
        const forceShutDownTimer = setTimeout(() => {
            logger.error("Shutdown timeout exceeded. Closing connections");
            server.closeAllConnections();
        }, 10_000);
        forceShutDownTimer.unref();
        server.close(async (error) => {
            clearTimeout(forceShutDownTimer);
            if (error) {
                logger.error({ err: error }, "HTTP server shutdown failed");
            }
            try {
                await prisma.$disconnect();
                logger.info("Database disconnected successfully");
            }
            catch (error) {
                logger.error({ err: error }, "Database disconnection failed");
                process.exitCode = 1;
            }
            if (error) {
                process.exitCode = 1;
            }
            logger.info("Application shutdown completed");
        });
    };
    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
};
const startServer = async () => {
    try {
        // Establish database connectivity first
        await prisma.$connect();
        logger.info("Database connected successfully");
        const server = app.listen(env.PORT, () => {
            logger.info({
                port: env.PORT,
                environment: env.NODE_ENV
            }, "Server started");
        });
        server.on("error", (error) => {
            logger.fatal({ err: error }, "HTTP server encountered an error");
            process.exitCode = 1;
        });
        configureGracefulShutdown(server);
    }
    catch (error) {
        logger.fatal({ err: error }, "Application startup failed");
        await prisma.$disconnect();
        process.exitCode = 1;
    }
};
void startServer();
//# sourceMappingURL=server.js.map