import { z } from 'zod';

// Mirrors booking-backend/src/validators/auth.validator.ts for instant client-side
// feedback. The backend schema is the authoritative one — this is UX only.
const passwordSchema = z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

export const registerSchema = z.object({
    fullName: z.string().trim().min(2, 'Full name is too short').max(100),
    email: z.email('Enter a valid email').trim().toLowerCase(),
    username: z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters')
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
    password: passwordSchema,
    phoneNumber: z.string().trim().min(7, 'Enter a valid phone number').max(20),
});

export const loginSchema = z.object({
    email: z.email('Enter a valid email').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
    captchaToken: z.string().min(1, 'Please complete the CAPTCHA'),
});

export const forgotPasswordSchema = z.object({
    email: z.email('Enter a valid email').trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
    password: passwordSchema,
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
