'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedBackendFetch } from '@/lib/backend';
import type { Booking } from '@/lib/types/booking';

export interface CreateBookingInput {
    resourceId: string;
    startTime: string;
    endTime: string;
    specialRequests?: string;
    contactPhone: string;
}

export interface BookingActionResult {
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[]>;
    booking?: Booking;
}

export async function createBookingAction(input: CreateBookingInput): Promise<BookingActionResult> {
    const response = await authenticatedBackendFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, message: data.message, fieldErrors: data.errors };
    }

    return { success: true, booking: data.booking };
}

export async function getMyBookingsAction(): Promise<Booking[]> {
    const response = await authenticatedBackendFetch('/api/bookings/me');
    if (!response.ok) return [];

    const data = await response.json();
    return data.bookings ?? [];
}

export async function cancelBookingAction(id: string): Promise<BookingActionResult> {
    const response = await authenticatedBackendFetch(`/api/bookings/${id}/cancel`, {
        method: 'PATCH',
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, message: data.message };
    }

    revalidatePath('/bookings');
    return { success: true, booking: data.booking };
}

// A <form action={...}> must return void — this thin wrapper is what gets bound
// to the cancel button; cancelBookingAction itself stays reusable elsewhere.
export async function cancelBookingFormAction(id: string): Promise<void> {
    await cancelBookingAction(id);
}
