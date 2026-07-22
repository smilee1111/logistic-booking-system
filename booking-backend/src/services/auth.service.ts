import { RegisterInput } from '../validators/auth.validator';
import { VerifyMfaInput } from '../validators/mfa.validator';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import {
    signAccessToken,
    signMfaPendingToken,
    signRefreshToken,
    verifyMfaPendingToken,
    verifyRefreshToken,
} from '../utils/jwt';
import { logActivity } from './activityLog.service';
import { verifyMfaChallenge } from './mfa.service';
import { findOrCreateGoogleUser } from './oauth.service';
import { sendPasswordResetEmail } from './notification.service';
import { generatePasswordResetToken, hashResetToken } from '../utils/passwordReset';
import { ForgotPasswordInput, ResetPasswordInput } from '../validators/auth.validator';
import { FRONTEND_ORIGIN } from '../config';

const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export async function registerUser(input: RegisterInput) {
    const exists = await userRepository.existsByEmailOrUsername(input.email, input.username);
    if (exists) {
        throw new AppError('An account with this email or username already exists', 409);
    }

    return userRepository.create(input);
}

// Same shape as loginUser's return value on purpose — the controller and
// frontend reuse the exact same MFA-pending / session-cookie handling either
// way, so a Google-linked account with mfaEnabled still can't skip the second
// factor just by going through OAuth instead of a password.
export async function loginWithGoogle(code: string, ipAddress: string) {
    const user = await findOrCreateGoogleUser(code);

    if (user.mfaEnabled) {
        const mfaPendingToken = signMfaPendingToken({ sub: user.id as string });
        await logActivity({
            userId: user.id,
            action: 'login',
            targetType: 'User',
            targetId: user.id,
            ipAddress,
            metadata: { mfaPending: true, provider: 'google' },
        });
        return { mfaRequired: true as const, mfaPendingToken };
    }

    const payload = { sub: user.id as string, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await logActivity({
        userId: user.id,
        action: 'login',
        targetType: 'User',
        targetId: user.id,
        ipAddress,
        metadata: { provider: 'google' },
    });

    return { mfaRequired: false as const, user, accessToken, refreshToken };
}

export async function loginUser(email: string, password: string, ipAddress: string) {
    const user = await userRepository.findByEmailWithSecrets(email);

    // Same error for "no such user" and "wrong password" so responses don't reveal
    // which accounts exist (user enumeration).
    if (!user) {
        await logActivity({
            action: 'login_failed',
            targetType: 'User',
            ipAddress,
            metadata: { attemptedEmail: email, reason: 'no_such_account' },
        });
        throw new AppError('Invalid email or password', 401);
    }

    if (user.lockoutUntil && user.lockoutUntil.getTime() > Date.now()) {
        await logActivity({
            userId: user.id,
            action: 'login_failed',
            targetType: 'User',
            targetId: user.id,
            ipAddress,
            metadata: { reason: 'locked' },
        });
        throw new AppError('Account temporarily locked due to repeated failed login attempts. Try again later.', 423);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
            user.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
            user.failedLoginAttempts = 0;
        }
        await user.save();
        await logActivity({
            userId: user.id,
            action: 'login_failed',
            targetType: 'User',
            targetId: user.id,
            ipAddress,
            metadata: { reason: 'bad_password' },
        });
        throw new AppError('Invalid email or password', 401);
    }

    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    if (user.mfaEnabled) {
        const mfaPendingToken = signMfaPendingToken({ sub: user.id as string });
        await logActivity({
            userId: user.id,
            action: 'login',
            targetType: 'User',
            targetId: user.id,
            ipAddress,
            metadata: { mfaPending: true },
        });
        return { mfaRequired: true as const, mfaPendingToken };
    }

    const payload = { sub: user.id as string, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await logActivity({ userId: user.id, action: 'login', targetType: 'User', targetId: user.id, ipAddress });

    return { mfaRequired: false as const, user, accessToken, refreshToken };
}

// Reissues the access token only — the refresh token keeps its original expiry,
// giving every session a hard 15-day cap regardless of how often it's refreshed.
// Re-fetching the user (rather than trusting the refresh token's embedded role)
// means a role change is picked up on the next refresh, not just at next login.
export async function refreshSession(refreshToken: string) {
    let payload;
    try {
        payload = verifyRefreshToken(refreshToken);
    } catch {
        throw new AppError('Invalid or expired refresh token — please log in again', 401);
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) {
        throw new AppError('Invalid or expired refresh token — please log in again', 401);
    }

    const accessToken = signAccessToken({ sub: user.id as string, role: user.role });

    return { accessToken };
}

export async function completeMfaLogin(mfaPendingToken: string, input: VerifyMfaInput) {
    let payload;
    try {
        payload = verifyMfaPendingToken(mfaPendingToken);
    } catch {
        throw new AppError('MFA session expired — please log in again', 401);
    }

    const user = await verifyMfaChallenge(payload.sub, input);

    const tokenPayload = { sub: user.id as string, role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return { user, accessToken, refreshToken };
}

// Always resolves successfully whether or not the email matches an account —
// the controller returns the same generic message either way, so a caller
// can't use this to enumerate registered emails. Silently no-ops if the email
// isn't found; no error, no timing-distinguishable path beyond the DB lookup
// itself.
export async function requestPasswordReset(input: ForgotPasswordInput, ipAddress: string): Promise<void> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) return;

    const { rawToken, tokenHash, expires } = generatePasswordResetToken();
    await userRepository.setPasswordResetToken(user.id, tokenHash, expires);

    await logActivity({
        userId: user.id,
        action: 'password_reset_requested',
        targetType: 'User',
        targetId: user.id,
        ipAddress,
    });

    const resetLink = `${FRONTEND_ORIGIN}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetLink);
}

export async function resetPassword(input: ResetPasswordInput, ipAddress: string): Promise<void> {
    const tokenHash = hashResetToken(input.token);
    const user = await userRepository.findByValidResetTokenHash(tokenHash);

    if (!user) {
        throw new AppError('This reset link is invalid or has expired', 400);
    }

    user.password = input.password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = null;
    // A password reset is a legitimate account-recovery action — clear any
    // existing lockout rather than leaving the user locked out of the
    // password they just proved control of the account to set.
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    await logActivity({
        userId: user.id,
        action: 'password_reset_completed',
        targetType: 'User',
        targetId: user.id,
        ipAddress,
    });
}
