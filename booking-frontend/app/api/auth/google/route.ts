import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const GOOGLE_REDIRECT_URI =
    process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3000/api/auth/google/callback';

// Starts the OAuth flow: stash a random state value, then send the browser to
// Google's consent screen. The callback route checks the state matches before
// trusting anything it gets back — without this, an attacker could craft a
// link that completes an OAuth flow *they* initiated inside the victim's
// session (login CSRF).
export async function GET() {
    const state = crypto.randomBytes(32).toString('hex');

    const cookieStore = await cookies();
    cookieStore.set('oauthState', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // Must be Lax, not Strict — this cookie has to survive the top-level
        // cross-site redirect Google sends the browser back through.
        sameSite: 'lax',
        path: '/',
        maxAge: 5 * 60,
    });

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'select_account');

    return NextResponse.redirect(authUrl.toString());
}
