'use server';

import { authenticatedBackendFetch } from '@/lib/backend';

export interface ActivityLogEntry {
    id: string;
    userId: string | null;
    action: string;
    targetType: string;
    targetId: string | null;
    ipAddress: string;
    timestamp: string;
    metadata: Record<string, unknown>;
}

export async function getActivityLogsAction(): Promise<ActivityLogEntry[]> {
    const response = await authenticatedBackendFetch('/api/logs');
    if (!response.ok) return [];

    const data = await response.json();
    return data.logs ?? [];
}
