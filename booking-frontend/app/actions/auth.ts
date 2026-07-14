'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import setCookie from 'set-cookie-parser';
import { authenticatedBackendFetch, backendFetch } from '@/lib/backend';
import type { LoginFormValues, RegisterFormValues } from '@/lib/validators/auth';

export interface AuthUser {
    id: string;
    fullName: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
}

export interface AuthActionResult {
    success: boolean;
    mfaRequired?: boolean;
    message?: string;
    fieldErrors?: Record<string, string[]>;
    user?: AuthUser;
}

export interface VerifyMfaInput {
    code?: string;
    backupCode?: string;
}

// The backend sets httpOnly cookies scoped to its own origin. Since the browser
// never talks to the backend directly in this architecture, we relay those
// Set-Cookie headers onto the Next.js origin so the browser actually receives them.
async function forwardSetCookies(response: Response): Promise<void> {
    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders.length === 0) return;

    const cookieStore = await cookies();
    for (const parsed of setCookie.parse(setCookieHeaders)) {
        cookieStore.set(parsed.name, parsed.value, {
            httpOnly: parsed.httpOnly,
            secure: parsed.secure,
            sameSite: parsed.sameSite?.toLowerCase() as 'strict' | 'lax' | 'none' | undefined,
            path: parsed.path,
            maxAge: parsed.maxAge,
            expires: parsed.expires,
        });
    }
}

export async function registerAction(values: RegisterFormValues): Promise<AuthActionResult> {
    const response = await backendFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, message: data.message, fieldErrors: data.errors };
    }

    return { success: true };
}

export async function loginAction(values: LoginFormValues): Promise<AuthActionResult> {
    const response = await backendFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, message: data.message, fieldErrors: data.errors };
    }

    // Relays whatever Set-Cookie headers came back — either the mfaPendingToken
    // (MFA required) or the real accessToken/refreshToken pair (no MFA needed).
    await forwardSetCookies(response);

    if (data.mfaRequired) {
        return { success: true, mfaRequired: true };
    }

    return { success: true, user: data.user };
}

export async function verifyMfaLoginAction(input: VerifyMfaInput): Promise<AuthActionResult> {
    const response = await authenticatedBackendFetch('/api/auth/verify-mfa', {
        method: 'POST',
        body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
        return { success: false, message: data.message, fieldErrors: data.errors };
    }

    await forwardSetCookies(response);

    return { success: true, user: data.user };
}

export async function logoutAction(): Promise<void> {
    try {
        await backendFetch('/api/auth/logout', { method: 'POST' });
    } catch {
        // Best-effort — the local cookies are cleared regardless below.
    }

    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    redirect('/login');
}
