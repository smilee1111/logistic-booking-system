import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { NODE_ENV } from '../config';

// Express 5 forwards thrown/rejected errors from async route handlers here automatically.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ZodError) {
        const { fieldErrors, formErrors } = z.flattenError(err);
        res.status(400).json({
            message: 'Validation failed',
            errors: fieldErrors,
            // Catches issues not tied to a specific field, e.g. an unrecognized key
            // rejected by .strict() — such as a client trying to set `role` directly.
            ...(formErrors.length > 0 && { formErrors }),
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    console.error(err);
    res.status(500).json({
        message: NODE_ENV === 'production' ? 'Internal server error' : (err as Error).message,
    });
}
