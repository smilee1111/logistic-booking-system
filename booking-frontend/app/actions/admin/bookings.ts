'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedBackendFetch } from '@/lib/backend';
import type { Booking } from '@/lib/types/booking';

export async function getAllBookingsAction(): Promise<Booking[]> {
    const response = await authenticatedBackendFetch('/api/bookings');
    if (!response.ok) return [];

    const data = await response.json();
    return data.bookings ?? [];
}

export async function decideBookingAction(id: string, decision: 'confirmed' | 'rejected'): Promise<void> {
    await authenticatedBackendFetch(`/api/bookings/${id}/decision`, {
        method: 'PATCH',
        body: JSON.stringify({ decision }),
    });
    revalidatePath('/admin/bookings');
}
