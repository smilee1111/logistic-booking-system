'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedBackendFetch } from '@/lib/backend';

export interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
    phoneNumber: string;
    mfaEnabled: boolean;
}

export async function getAllUsersAction(): Promise<AdminUser[]> {
    const response = await authenticatedBackendFetch('/api/users');
    if (!response.ok) return [];

    const data = await response.json();
    return data.users ?? [];
}

export async function changeUserRoleAction(id: string, role: 'user' | 'admin'): Promise<void> {
    await authenticatedBackendFetch(`/api/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
    });
    revalidatePath('/admin/users');
}
