import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
    const token = req.cookies?.accessToken;

    if (!token) {
        throw new AppError('Authentication required', 401);
    }

    try {
        req.user = verifyAccessToken(token);
    } catch {
        throw new AppError('Invalid or expired session', 401);
    }

    next();
}

export function requireRole(...roles: Array<'user' | 'admin'>) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new AppError('Insufficient permissions', 403);
        }
        next();
    };
}
