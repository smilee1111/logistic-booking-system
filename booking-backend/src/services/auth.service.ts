import { RegisterInput } from '../validators/auth.validator';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken } from '../utils/jwt';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export async function registerUser(input: RegisterInput) {
    const exists = await userRepository.existsByEmailOrUsername(input.email, input.username);
    if (exists) {
        throw new AppError('An account with this email or username already exists', 409);
    }

    return userRepository.create(input);
}

export async function loginUser(email: string, password: string) {
    const user = await userRepository.findByEmailWithSecrets(email);

    // Same error for "no such user" and "wrong password" so responses don't reveal
    // which accounts exist (user enumeration).
    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    if (user.lockoutUntil && user.lockoutUntil.getTime() > Date.now()) {
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
        throw new AppError('Invalid email or password', 401);
    }

    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    await user.save();

    const payload = { sub: user.id as string, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return { user, accessToken, refreshToken };
}
