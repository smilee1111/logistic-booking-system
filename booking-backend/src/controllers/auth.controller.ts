import { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import {
    forgotPasswordSchema,
    googleCallbackSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
} from '../validators/auth.validator';
import { verifyMfaSchema } from '../validators/mfa.validator';
import {
    completeMfaLogin,
    loginUser,
    loginWithGoogle,
    refreshSession,
    registerUser,
    requestPasswordReset,
    resetPassword,
} from '../services/auth.service';
import { COOKIE_SECURE } from '../config';
import { ACCESS_TOKEN_TTL_SECONDS, MFA_PENDING_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from '../utils/jwt';
import { verifyCaptcha } from '../utils/captcha';
import { AppError } from '../utils/AppError';
import type { IUser } from '../models/User';

const ACCESS_COOKIE_NAME = 'accessToken';
const REFRESH_COOKIE_NAME = 'refreshToken';
const MFA_PENDING_COOKIE_NAME = 'mfaPendingToken';

function setSessionCookies(res: Response, accessToken: string, refreshToken: string) {
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
}

function setAccessCookie(res: Response, accessToken: string) {
    res.cookie(ACCESS_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: 'strict',
        path: '/',
        maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
    });
}

function toSessionUser(user: HydratedDocument<IUser>) {
    return { id: user.id, fullName: user.fullName, email: user.email, username: user.username, role: user.role };
}

export async function register(req: Request, res: Response) {
    const input = registerSchema.parse(req.body);
    const user = await registerUser(input);

    res.status(201).json({
        message: 'Account created successfully',
        user: toSessionUser(user),
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

    const result = await loginUser(email, password, req.ip ?? 'unknown');

    if (result.mfaRequired) {
        res.cookie(MFA_PENDING_COOKIE_NAME, result.mfaPendingToken, {
            httpOnly: true,
            secure: COOKIE_SECURE,
            sameSite: 'strict',
            path: '/',
            maxAge: MFA_PENDING_TOKEN_TTL_SECONDS * 1000,
        });
        res.status(200).json({ mfaRequired: true, message: 'MFA verification required' });
        return;
    }

    setSessionCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
        message: 'Logged in successfully',
        user: toSessionUser(result.user),
    });
}

export async function verifyMfa(req: Request, res: Response) {
    const input = verifyMfaSchema.parse(req.body);
    const mfaPendingToken = req.cookies?.mfaPendingToken;

    if (!mfaPendingToken) {
        throw new AppError('No pending MFA session — please log in again', 401);
    }

    const { user, accessToken, refreshToken } = await completeMfaLogin(mfaPendingToken, input);

    res.clearCookie(MFA_PENDING_COOKIE_NAME, { path: '/' });
    setSessionCookies(res, accessToken, refreshToken);

    res.status(200).json({
        message: 'Logged in successfully',
        user: toSessionUser(user),
    });
}

export async function refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new AppError('No refresh token provided', 401);
    }

    const { accessToken } = await refreshSession(refreshToken);
    setAccessCookie(res, accessToken);

    res.status(200).json({ message: 'Session refreshed' });
}

export async function googleLogin(req: Request, res: Response) {
    const { code } = googleCallbackSchema.parse(req.body);

    const result = await loginWithGoogle(code, req.ip ?? 'unknown');

    if (result.mfaRequired) {
        res.cookie(MFA_PENDING_COOKIE_NAME, result.mfaPendingToken, {
            httpOnly: true,
            secure: COOKIE_SECURE,
            sameSite: 'strict',
            path: '/',
            maxAge: MFA_PENDING_TOKEN_TTL_SECONDS * 1000,
        });
        res.status(200).json({ mfaRequired: true, message: 'MFA verification required' });
        return;
    }

    setSessionCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
        message: 'Logged in successfully',
        user: toSessionUser(result.user),
    });
}

export async function logout(_req: Request, res: Response) {
    res.clearCookie(ACCESS_COOKIE_NAME, { path: '/' });
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
    res.status(200).json({ message: 'Logged out successfully' });
}

// Always 200 with the same message, whether or not the email matches an
// account — the service layer enforces this too, but it's repeated here as
// the actual contract: no branch in this handler may ever depend on whether
// requestPasswordReset found a user.
export async function forgotPassword(req: Request, res: Response) {
    const input = forgotPasswordSchema.parse(req.body);
    await requestPasswordReset(input, req.ip ?? 'unknown');

    res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
}

export async function resetPasswordHandler(req: Request, res: Response) {
    const input = resetPasswordSchema.parse(req.body);
    await resetPassword(input, req.ip ?? 'unknown');

    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
}
