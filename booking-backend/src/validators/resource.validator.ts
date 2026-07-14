import { z } from 'zod';

// createdBy is deliberately excluded — set server-side from the authenticated
// admin's id, never accepted from the client (mass-assignment protection).
export const createResourceSchema = z
    .object({
        name: z.string().trim().min(2).max(100),
        description: z.string().trim().min(1).max(2000),
        category: z.enum(['lab', 'equipment', 'room']),
        location: z.string().trim().min(1).max(200),
        capacity: z.number().int().min(1),
        requiresApproval: z.boolean().default(false),
        isActive: z.boolean().default(true),
    })
    .strict();

export const updateResourceSchema = z
    .object({
        name: z.string().trim().min(2).max(100).optional(),
        description: z.string().trim().min(1).max(2000).optional(),
        category: z.enum(['lab', 'equipment', 'room']).optional(),
        location: z.string().trim().min(1).max(200).optional(),
        capacity: z.number().int().min(1).optional(),
        requiresApproval: z.boolean().optional(),
        isActive: z.boolean().optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
