'use server';

import { revalidatePath } from 'next/cache';
import { authenticatedBackendFetch } from '@/lib/backend';
import type { Resource } from '@/lib/types/resource';
import type { ResourceFormValues } from '@/lib/validators/resource';

export interface ResourceActionResult {
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[]>;
    resource?: Resource;
}

export async function createResourceAction(input: ResourceFormValues): Promise<ResourceActionResult> {
    const response = await authenticatedBackendFetch('/api/resources', {
        method: 'POST',
        body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, message: data.message, fieldErrors: data.errors };
    }

    revalidatePath('/admin/resources');
    revalidatePath('/resources');
    return { success: true, resource: data.resource };
}

export async function updateResourceAction(
    id: string,
    input: ResourceFormValues
): Promise<ResourceActionResult> {
    const response = await authenticatedBackendFetch(`/api/resources/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, message: data.message, fieldErrors: data.errors };
    }

    revalidatePath('/admin/resources');
    revalidatePath('/resources');
    return { success: true, resource: data.resource };
}

export async function deleteResourceAction(id: string): Promise<void> {
    await authenticatedBackendFetch(`/api/resources/${id}`, { method: 'DELETE' });
    revalidatePath('/admin/resources');
    revalidatePath('/resources');
}
