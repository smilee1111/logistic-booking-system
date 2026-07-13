import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/backend';
import type { AuthUser } from '@/app/actions/auth';

// Forwards whatever cookies the incoming request carried (accessToken, if any)
// to the backend's /users/me, so the root layout can rehydrate auth state on
// every server render instead of starting logged-out until the user logs in again.
export async function getCurrentUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    if (!cookieHeader) return null;

    const response = await backendFetch('/api/users/me', {
        headers: { Cookie: cookieHeader },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.user ?? null;
}
