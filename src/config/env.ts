import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    PORT: z.coerce
        .number()
        .int()
        .positive()
        .default(3000),

    LOG_LEVEL: z
        .enum([
            "fatal",
            "error",
            "warn",
            "info",
            "debug",
            "trace",
            "silent",
        ])
        .default("info"),

    DATABASE_URL: z.url(),

    // Authentication configuration

    ACCESS_TOKEN_SECRET: z.string().min(64),

    JWT_ISSUER: z.string().min(1),

    JWT_AUDIENCE: z.string().min(1),

    ACCESS_TOKEN_TTL_SECONDS: z.coerce
        .number()
        .int()
        .min(60)
        .max(3600)
        .default(900),

    REFRESH_TOKEN_TTL_DAYS: z.coerce
        .number()
        .int()
        .min(1)
        .max(30)
        .default(7),

    SESSION_TTL_DAYS: z.coerce
        .number()
        .int()
        .min(1)
        .max(90)
        .default(30),

    COOKIE_SAME_SITE: z
        .enum(["strict", "lax", "none"])
        .default("lax"),
});

export const env = envSchema.parse(process.env);