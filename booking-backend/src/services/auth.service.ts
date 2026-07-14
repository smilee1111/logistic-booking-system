import { RegisterInput } from '../validators/auth.validator';
import { VerifyMfaInput } from '../validators/mfa.validator';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { signAccessToken, signMfaPendingToken, signRefreshToken, verifyMfaPendingToken } from '../utils/jwt';
import { logActivity } from './activityLog.service';
import { verifyMfaChallenge } from './mfa.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export async function registerUser(input: RegisterInput) {
    const exists = await userRepository.existsByEmailOrUsername(input.email, input.username);
    if (exists) {
        throw new AppError('An account with this email or username already exists', 409);
    }

    return userRepository.create(input);
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
