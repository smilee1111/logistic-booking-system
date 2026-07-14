import { cookies } from 'next/headers';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:5050';

export async function backendFetch(path: string, init?: RequestInit): Promise<Response> {
    return fetch(`${BACKEND_API_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });
}

// For calls that need to act as the currently logged-in user — forwards whatever
// cookies (accessToken, mfaPendingToken, etc.) the incoming request carried.
export async function authenticatedBackendFetch(path: string, init?: RequestInit): Promise<Response> {
    const cookieStore = await cookies();
    return backendFetch(path, {
        ...init,
        headers: { Cookie: cookieStore.toString(), ...init?.headers },
    });
}
