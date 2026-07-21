import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from '../config';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';

const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

interface GoogleProfile {
    email: string;
    fullName: string;
    googleId: string;
}

// Exchanges the one-time authorization code for tokens, then verifies the ID
// token's signature against Google's published keys (google-auth-library
// handles key rotation) — never trusts the payload without verifying it.
async function verifyGoogleCode(code: string): Promise<GoogleProfile> {
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
        throw new AppError('Google did not return an ID token', 502);
    }

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
        throw new AppError('Google account has no verified email', 400);
    }

    return {
        email: payload.email,
        fullName: payload.name ?? payload.email.split('@')[0],
        googleId: payload.sub,
    };
}

async function generateUniqueUsername(base: string): Promise<string> {
    const cleanBase = base.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || 'user';
    let candidate = cleanBase;
    let suffix = 0;

    // Extremely unlikely to loop more than once or twice in practice.
    while (await userRepository.existsByUsername(candidate)) {
        suffix += 1;
        candidate = `${cleanBase}${suffix}`;
    }

    return candidate;
}

// Links Google to an existing account matched by verified email, or creates a
// brand-new Google-only account (no password) if no account exists yet.
export async function findOrCreateGoogleUser(code: string) {
    const profile = await verifyGoogleCode(code);

    const existing = await userRepository.findByEmail(profile.email);
    if (existing) {
        if (!existing.googleId) {
            await userRepository.linkGoogleId(existing.id, profile.googleId);
        }
        return existing;
    }

    const username = await generateUniqueUsername(profile.email.split('@')[0]);
    return userRepository.createGoogleUser({
        fullName: profile.fullName,
        email: profile.email,
        username,
        googleId: profile.googleId,
    });
}
