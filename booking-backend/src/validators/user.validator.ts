import { z } from 'zod';

export const updateMeSchema = z
    .object({
        fullName: z.string().trim().min(2).max(100).optional(),
        phoneNumber: z.string().trim().min(7).max(20).optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export const updateRoleSchema = z
    .object({
        role: z.enum(['user', 'admin']),
    })
    .strict();

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
