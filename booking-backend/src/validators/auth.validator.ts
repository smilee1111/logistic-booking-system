import { z } from 'zod';

const passwordSchema = z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

// .strict() rejects any field not listed here (e.g. role, isVerified) instead of
// silently dropping it — an attempted mass-assignment surfaces as a 400, not a no-op.
export const registerSchema = z
    .object({
        fullName: z.string().trim().min(2).max(100),
        email: z.email().trim().toLowerCase(),
        username: z
            .string()
            .trim()
            .min(3)
            .max(30)
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        password: passwordSchema,
        phoneNumber: z.string().trim().min(7).max(20),
    })
    .strict();

export const loginSchema = z
    .object({
        email: z.email().trim().toLowerCase(),
        password: z.string().min(1, 'Password is required'),
        captchaToken: z.string().min(1, 'CAPTCHA verification is required'),
    })
    .strict();

export const googleCallbackSchema = z
    .object({
        code: z.string().min(1, 'Authorization code is required'),
    })
    .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleCallbackInput = z.infer<typeof googleCallbackSchema>;
