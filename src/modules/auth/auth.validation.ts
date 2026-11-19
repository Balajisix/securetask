
import { z } from "zod";

const emailSchema = z
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim()
    .max(320);

const emptyObjectSchema = z.object({}).strict();
export const registerSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: z
            .string()
            .min(15, "Password must be at least 15 characters")
            .max(128, "Password cannot exceed 128 characters"),
        firstName: z
            .string()
            .trim()
            .min(1)
            .max(100)
            .optional(),
        lastName: z
            .string()
            .trim()
            .min(1)
            .max(100)
            .optional(),
    }).strict(),
    params: emptyObjectSchema,
    query: emptyObjectSchema,
}).strict();

export const loginSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: z
            .string()
            .min(1, "Password is required")
            .max(128),

    }).strict(),
    params: emptyObjectSchema,
    query: emptyObjectSchema,
}).strict();

export type RegisterRequest = z.infer<
    typeof registerSchema
>;

export type LoginRequest = z.infer<
    typeof loginSchema
>;
