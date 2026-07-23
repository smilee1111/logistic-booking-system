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
import { toCsv } from '../utils/csv';
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

const EXPORT_COLUMNS = [
    'id',
    'resourceId',
    'startTime',
    'endTime',
    'status',
    'specialRequests',
    'contactPhone',
    'createdAt',
];

// Owner-only export of the requester's own bookings — a privacy/data-portability
// feature, not an admin one.
export async function exportMine(req: Request, res: Response) {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const bookings = await getMyBookings(req.user!.sub);
    const publicBookings = bookings.map(toPublicBooking);

    if (format === 'json') {
        res.setHeader('Content-Disposition', 'attachment; filename="bookings.json"');
        res.status(200).json({ bookings: publicBookings });
        return;
    }

    const csv = toCsv(
        publicBookings.map((b) => ({
            id: b.id,
            resourceId: String(b.resourceId),
            startTime: new Date(b.startTime).toISOString(),
            endTime: new Date(b.endTime).toISOString(),
            status: b.status,
            specialRequests: b.specialRequests,
            contactPhone: b.contactPhone,
            createdAt: new Date(b.createdAt).toISOString(),
        })),
        EXPORT_COLUMNS
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
    res.status(200).send(csv);
}

interface PopulatedRef {
    _id: unknown;
    fullName?: string;
    name?: string;
}

// Only used for the admin listing, where userId/resourceId are populated
// (see booking.repository.ts findAll) — every other endpoint still returns
// plain ObjectIds via toPublicBooking.
function toAdminBooking(booking: HydratedDocument<IBooking>) {
    const user = booking.userId as unknown as PopulatedRef;
    const resource = booking.resourceId as unknown as PopulatedRef;

    return {
        ...toPublicBooking(booking),
        userId: String(user._id),
        userName: user.fullName ?? null,
        resourceId: String(resource._id),
        resourceName: resource.name ?? null,
    };
}

export async function getAll(_req: Request, res: Response) {
    const bookings = await getAllBookings();
    res.status(200).json({ bookings: bookings.map(toAdminBooking) });
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
