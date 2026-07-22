import crypto from 'crypto';

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export interface PasswordResetToken {
    rawToken: string;
    tokenHash: string;
    expires: Date;
}

// SHA-256, not bcrypt — see the note on User.passwordResetTokenHash. The raw
// token is what goes in the reset link and is never stored; only its hash is.
export function generatePasswordResetToken(): PasswordResetToken {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    return { rawToken, tokenHash, expires };
}

export function hashResetToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}
