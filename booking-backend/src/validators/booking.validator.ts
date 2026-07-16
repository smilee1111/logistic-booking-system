import { z } from 'zod';

// status and decidedBy are never accepted from the client — set server-side only.
export const createBookingSchema = z
    .object({
        resourceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid resource id'),
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
        specialRequests: z.string().trim().max(2000).optional().default(''),
        contactPhone: z.string().trim().min(7).max(20),
    })
    .strict()
    .refine((data) => data.endTime > data.startTime, {
        message: 'endTime must be after startTime',
        path: ['endTime'],
    })
    .refine((data) => data.startTime > new Date(), {
        message: 'startTime must be in the future',
        path: ['startTime'],
    });

export const decisionSchema = z
    .object({
        decision: z.enum(['confirmed', 'rejected']),
    })
    .strict();

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type DecisionInput = z.infer<typeof decisionSchema>;
