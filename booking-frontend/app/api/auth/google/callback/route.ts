import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendFetch, forwardSetCookies } from '@/lib/backend';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const cookieStore = await cookies();
    const expectedState = cookieStore.get('oauthState')?.value;
    cookieStore.delete('oauthState');

    if (!code || !state || !expectedState || state !== expectedState) {
        return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    }

    const response = await backendFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });

    if (!response.ok) {
        return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    }

    await forwardSetCookies(response);

    const data = await response.json();
    if (data.mfaRequired) {
        return NextResponse.redirect(new URL('/login?mfaRequired=1', request.url));
    }

    return NextResponse.redirect(new URL('/', request.url));
}
