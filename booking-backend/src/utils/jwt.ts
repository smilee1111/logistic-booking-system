import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_SECRET, MFA_PENDING_SECRET } from '../config';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_TTL_SECONDS = 15 * 24 * 60 * 60; // 15 days
export const MFA_PENDING_TOKEN_TTL_SECONDS = 5 * 60; // 5 minutes

export interface JwtPayload {
    sub: string;
    role: 'user' | 'admin';
}

export interface MfaPendingPayload {
    sub: string;
}

export function signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
}

export function signRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL_SECONDS });
}

export function verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}

// Signed with its own secret (not JWT_SECRET) so an mfaPendingToken can never be
// mistaken for a real accessToken by requireAuth, even by accident.
export function signMfaPendingToken(payload: MfaPendingPayload): string {
    return jwt.sign(payload, MFA_PENDING_SECRET, { expiresIn: MFA_PENDING_TOKEN_TTL_SECONDS });
}

export function verifyMfaPendingToken(token: string): MfaPendingPayload {
    return jwt.verify(token, MFA_PENDING_SECRET) as MfaPendingPayload;
}
