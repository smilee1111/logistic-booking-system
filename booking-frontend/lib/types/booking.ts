export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
    id: string;
    userId: string;
    resourceId: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    specialRequests: string;
    contactPhone: string;
    decidedBy: string | null;
    createdAt: string;
    updatedAt: string;
    // Only populated on the admin listing (GET /api/bookings) — absent elsewhere.
    userName?: string | null;
    resourceName?: string | null;
}
