import { z } from 'zod';

export const resourceFormSchema = z.object({
    name: z.string().trim().min(2, 'Name is too short').max(100),
    description: z.string().trim().min(1, 'Description is required').max(2000),
    category: z.enum(['lab', 'equipment', 'room']),
    location: z.string().trim().min(1, 'Location is required').max(200),
    capacity: z.number().int().min(1, 'Capacity must be at least 1'),
    requiresApproval: z.boolean(),
    isActive: z.boolean(),
});

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;
