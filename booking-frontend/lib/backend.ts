import { cookies } from 'next/headers';
import setCookie from 'set-cookie-parser';

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

// The backend sets httpOnly cookies scoped to its own origin. Since the browser
// never talks to the backend directly in this architecture, we relay those
// Set-Cookie headers onto the Next.js origin so the browser actually receives them.
export async function forwardSetCookies(response: Response): Promise<void> {
    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders.length === 0) return;

    const cookieStore = await cookies();
    for (const parsed of setCookie.parse(setCookieHeaders)) {
        try {
            cookieStore.set(parsed.name, parsed.value, {
                httpOnly: parsed.httpOnly,
                secure: parsed.secure,
                sameSite: parsed.sameSite?.toLowerCase() as 'strict' | 'lax' | 'none' | undefined,
                path: parsed.path,
                maxAge: parsed.maxAge,
                expires: parsed.expires,
            });
        } catch {
            // Cookies can only be mutated from a Server Action or Route Handler, not
            // during a Server Component's render (e.g. the root layout calling
            // getCurrentUser). Callers that need the refreshed value immediately
            // (see attemptSessionRefresh below) don't depend on this persisting.
        }
    }
}

async function buildCookieHeader(overrides: Record<string, string> = {}): Promise<string> {
    const cookieStore = await cookies();
    const merged = new Map(cookieStore.getAll().map((c) => [c.name, c.value]));
    for (const [name, value] of Object.entries(overrides)) {
        merged.set(name, value);
    }
    return Array.from(merged.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
}

// Returns the new access token on success. Also best-effort persists it via
// forwardSetCookies for next time, but that persist is a no-op during a Server
// Component render — the returned value lets the immediate retry below use the
// fresh token regardless of whether the persist actually took.
async function attemptSessionRefresh(): Promise<string | null> {
    const cookieHeader = await buildCookieHeader();
    const response = await backendFetch('/api/auth/refresh', {
        method: 'POST',
        headers: { Cookie: cookieHeader },
    });

    if (!response.ok) return null;

    await forwardSetCookies(response);

    const parsed = setCookie.parse(response.headers.getSetCookie());
    return parsed.find((c) => c.name === 'accessToken')?.value ?? null;
}

// For calls that need to act as the currently logged-in user — forwards whatever
// cookies (accessToken, mfaPendingToken, etc.) the incoming request carried. On a
// 401 (expired access token), attempts one silent refresh and retries once before
// giving up — so a session doesn't just die the moment the 15-minute access token
// expires while the refresh token is still valid.
export async function authenticatedBackendFetch(path: string, init?: RequestInit): Promise<Response> {
    const cookieHeader = await buildCookieHeader();
    const response = await backendFetch(path, {
        ...init,
        headers: { Cookie: cookieHeader, ...init?.headers },
    });

    if (response.status !== 401) {
        return response;
    }

    const newAccessToken = await attemptSessionRefresh();
    if (!newAccessToken) {
        return response;
    }

    const retryCookieHeader = await buildCookieHeader({ accessToken: newAccessToken });
    return backendFetch(path, {
        ...init,
        headers: { Cookie: retryCookieHeader, ...init?.headers },
    });
}
