import { z } from 'zod';

export const verifySetupSchema = z
    .object({
        code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your authenticator app'),
    })
    .strict();

export const verifyMfaSchema = z
    .object({
        code: z.string().regex(/^\d{6}$/).optional(),
        backupCode: z.string().min(1).optional(),
    })
    .strict()
    .refine((data) => !!data.code || !!data.backupCode, {
        message: 'Provide either a 6-digit code or a backup code',
    });

export type VerifySetupInput = z.infer<typeof verifySetupSchema>;
export type VerifyMfaInput = z.infer<typeof verifyMfaSchema>;
