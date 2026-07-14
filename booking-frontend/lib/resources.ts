import { backendFetch } from '@/lib/backend';
import type { Resource } from '@/lib/types/resource';

// Public endpoint — no cookies needed, just a plain server-to-server fetch.
export async function getResources(): Promise<Resource[]> {
    const response = await backendFetch('/api/resources');
    if (!response.ok) return [];

    const data = await response.json();
    return data.resources ?? [];
}
