import { Request, Response } from 'express';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { loginUser, registerUser } from '../services/auth.service';
import { COOKIE_SECURE } from '../config';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from '../utils/jwt';
import { verifyCaptcha } from '../utils/captcha';
import { AppError } from '../utils/AppError';

const ACCESS_COOKIE_NAME = 'accessToken';
const REFRESH_COOKIE_NAME = 'refreshToken';

export async function register(req: Request, res: Response) {
    const input = registerSchema.parse(req.body);
    const user = await registerUser(input);

    res.status(201).json({
        message: 'Account created successfully',
        user: { id: user.id, fullName: user.fullName, email: user.email, username: user.username, role: user.role },
    });
}

export async function login(req: Request, res: Response) {
    const { email, password, captchaToken } = loginSchema.parse(req.body);

    // Verified before any DB lookup or bcrypt comparison — a bot with no valid
    // token gets rejected cheaply, instead of spending a bcrypt.compare and a
    // lockout-counter increment on it.
    const captchaValid = await verifyCaptcha(captchaToken);
    if (!captchaValid) {
        throw new AppError('CAPTCHA verification failed', 400);
    }

    const { user, accessToken, refreshToken } = await loginUser(email, password, req.ip ?? 'unknown');

    res.cookie(ACCESS_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: 'strict',
        path: '/',
        maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: 'strict',
        path: '/',
        maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });

    res.status(200).json({
        message: 'Logged in successfully',
        user: { id: user.id, fullName: user.fullName, email: user.email, username: user.username, role: user.role },
    });
}

export async function logout(_req: Request, res: Response) {
    res.clearCookie(ACCESS_COOKIE_NAME, { path: '/' });
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
    res.status(200).json({ message: 'Logged out successfully' });
}
