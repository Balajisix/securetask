import { randomUUID } from "node:crypto";

import pino from "pino";
import { pinoHttp } from "pino-http";

import { env } from "../config/env.js";

// Application logger
const logger = pino({
  level: env.LOG_LEVEL,

  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers.set-cookie",
    ],
    censor: "[REDACTED]",
  },

  ...(env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

// HTTP request logger
export const httpLogger = pinoHttp({
  logger,

  genReqId: (_req, res) => {
    const existingRequestId = res.getHeader("X-Request-Id");

    if (existingRequestId) {
      return String(existingRequestId);
    }

    const requestId = randomUUID();
    res.setHeader("X-Request-Id", requestId);

    return requestId;
  },

  customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },
});

export { logger };