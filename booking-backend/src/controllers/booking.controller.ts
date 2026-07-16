import { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import { createBookingSchema, decisionSchema } from '../validators/booking.validator';
import {
    cancelBooking,
    createBooking,
    decideBooking,
    getAllBookings,
    getBookingById,
    getMyBookings,
} from '../services/booking.service';
import { decryptContactPhone } from '../utils/contactEncryption';
import { AppError } from '../utils/AppError';
import type { IBooking } from '../models/Booking';

function toPublicBooking(booking: HydratedDocument<IBooking>) {
    return {
        id: booking.id,
        userId: booking.userId,
        resourceId: booking.resourceId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        specialRequests: booking.specialRequests,
        contactPhone: decryptContactPhone(booking.contactPhone),
        decidedBy: booking.decidedBy,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
    };
}

export async function create(req: Request, res: Response) {
    const input = createBookingSchema.parse(req.body);
    const booking = await createBooking(req.user!.sub, input, req.ip ?? 'unknown');
    res.status(201).json({ booking: toPublicBooking(booking) });
}

export async function getOne(req: Request, res: Response) {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new AppError('Booking not found', 404);
    }
    const booking = await getBookingById(id, req.user!);
    res.status(200).json({ booking: toPublicBooking(booking) });
}

export async function getMine(req: Request, res: Response) {
    const bookings = await getMyBookings(req.user!.sub);
    res.status(200).json({ bookings: bookings.map(toPublicBooking) });
}

export async function getAll(_req: Request, res: Response) {
    const bookings = await getAllBookings();
    res.status(200).json({ bookings: bookings.map(toPublicBooking) });
}

export async function cancel(req: Request, res: Response) {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new AppError('Booking not found', 404);
    }
    const booking = await cancelBooking(id, req.user!, req.ip ?? 'unknown');
    res.status(200).json({ booking: toPublicBooking(booking) });
}

export async function decide(req: Request, res: Response) {
    const input = decisionSchema.parse(req.body);
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new AppError('Booking not found', 404);
    }
    const booking = await decideBooking(id, input, req.user!.sub, req.ip ?? 'unknown');
    res.status(200).json({ booking: toPublicBooking(booking) });
}
