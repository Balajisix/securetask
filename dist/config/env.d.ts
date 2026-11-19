import "dotenv/config";
export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    LOG_LEVEL: "error" | "fatal" | "warn" | "info" | "debug" | "trace" | "silent";
    DATABASE_URL: string;
    ACCESS_TOKEN_SECRET: string;
    JWT_ISSUER: string;
    JWT_AUDIENCE: string;
    ACCESS_TOKEN_TTL_SECONDS: number;
    REFRESH_TOKEN_TTL_DAYS: number;
    SESSION_TTL_DAYS: number;
    COOKIE_SAME_SITE: "strict" | "lax" | "none";
};
