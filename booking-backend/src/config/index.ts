import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, 'config.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5050),
    LOCAL_DATABASE_URI: z.string().min(1, 'LOCAL_DATABASE_URI is required'),

    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    MFA_PENDING_SECRET: z.string().min(32, 'MFA_PENDING_SECRET must be at least 32 characters'),

    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

    MFA_ENCRYPTION_KEY: z
        .string()
        .regex(/^[0-9a-f]{64}$/i, 'MFA_ENCRYPTION_KEY must be a 32-byte hex string'),
    CONTACT_ENCRYPTION_KEY: z
        .string()
        .regex(/^[0-9a-f]{64}$/i, 'CONTACT_ENCRYPTION_KEY must be a 32-byte hex string'),

    COOKIE_SECURE: z
        .string()
        .default('false')
        .transform((v) => v === 'true'),

    RECAPTCHA_SECRET_KEY: z.string().min(1, 'RECAPTCHA_SECRET_KEY is required'),

    FRONTEND_ORIGIN: z.url().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Invalid environment configuration:');
    console.error(z.flattenError(parsed.error).fieldErrors);
    process.exit(1);
}

const env = parsed.data;

if (env.NODE_ENV === 'production' && !env.COOKIE_SECURE) {
    console.error('COOKIE_SECURE must be true when NODE_ENV=production');
    process.exit(1);
}

const secrets = [env.JWT_SECRET, env.JWT_REFRESH_SECRET, env.MFA_PENDING_SECRET];
if (new Set(secrets).size !== secrets.length) {
    console.error('JWT_SECRET, JWT_REFRESH_SECRET, and MFA_PENDING_SECRET must all be different values');
    process.exit(1);
}

export const NODE_ENV = env.NODE_ENV;
export const PORT = env.PORT;
export const LOCAL_DATABASE_URI = env.LOCAL_DATABASE_URI;
export const JWT_SECRET = env.JWT_SECRET;
export const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;
export const MFA_PENDING_SECRET = env.MFA_PENDING_SECRET;
export const BCRYPT_SALT_ROUNDS = env.BCRYPT_SALT_ROUNDS;
export const MFA_ENCRYPTION_KEY = env.MFA_ENCRYPTION_KEY;
export const CONTACT_ENCRYPTION_KEY = env.CONTACT_ENCRYPTION_KEY;
export const COOKIE_SECURE = env.COOKIE_SECURE;
export const RECAPTCHA_SECRET_KEY = env.RECAPTCHA_SECRET_KEY;
export const FRONTEND_ORIGIN = env.FRONTEND_ORIGIN;
