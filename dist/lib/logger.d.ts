import pino from "pino";
declare const logger: pino.Logger<never, boolean>;
export declare const httpLogger: import("pino-http").HttpLogger<import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, never>;
export { logger };
