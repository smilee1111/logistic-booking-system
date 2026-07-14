import { z } from 'zod';

// Mirrors booking-backend/src/validators/booking.validator.ts for instant client-side
// feedback. The backend schema is the authoritative one — this is UX only.
export const createBookingSchema = z
    .object({
        resourceId: z.string().min(1),
        startTime: z.string().min(1, 'Start time is required'),
        endTime: z.string().min(1, 'End time is required'),
        specialRequests: z.string().max(2000),
        contactPhone: z.string().trim().min(7, 'Enter a valid phone number').max(20),
    })
    .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
        message: 'End time must be after start time',
        path: ['endTime'],
    });

export type CreateBookingFormValues = z.infer<typeof createBookingSchema>;
