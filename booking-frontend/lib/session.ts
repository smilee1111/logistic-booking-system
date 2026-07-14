import { authenticatedBackendFetch } from '@/lib/backend';
import type { AuthUser } from '@/app/actions/auth';

// So the root layout can rehydrate auth state on every server render instead of
// starting logged-out until the user logs in again.
export async function getCurrentUser(): Promise<AuthUser | null> {
    const response = await authenticatedBackendFetch('/api/users/me');

    if (!response.ok) return null;

    const data = await response.json();
    return data.user ?? null;
}
