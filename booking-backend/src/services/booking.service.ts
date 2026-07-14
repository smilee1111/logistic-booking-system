import { bookingRepository } from '../repositories/booking.repository';
import { resourceRepository } from '../repositories/resource.repository';
import { AppError } from '../utils/AppError';
import { isValidObjectId } from '../utils/objectId';
import { encryptContactPhone } from '../utils/contactEncryption';
import { logActivity } from './activityLog.service';
import { CreateBookingInput, DecisionInput } from '../validators/booking.validator';

export async function createBooking(userId: string, input: CreateBookingInput, ipAddress: string) {
    if (!isValidObjectId(input.resourceId)) {
        throw new AppError('Resource not found', 404);
    }

    const resource = await resourceRepository.findById(input.resourceId);
    if (!resource || !resource.isActive) {
        throw new AppError('Resource not found', 404);
    }

    // Check-then-insert — see the note on the model's compound index for why
    // this doesn't use a literal DB transaction here.
    const overlapping = await bookingRepository.findOverlapping(input.resourceId, input.startTime, input.endTime);
    if (overlapping) {
        throw new AppError('This resource is already booked for the selected time range', 409);
    }

    const booking = await bookingRepository.create({
        userId,
        resourceId: input.resourceId,
        startTime: input.startTime,
        endTime: input.endTime,
        specialRequests: input.specialRequests,
        contactPhone: encryptContactPhone(input.contactPhone),
        status: resource.requiresApproval ? 'pending' : 'confirmed',
    });

    await logActivity({ userId, action: 'booking_created', targetType: 'Booking', targetId: booking.id, ipAddress });

    return booking;
}

// SECURITY NOTE (intentional, temporary): no ownership/role check here — any
// authenticated user can fetch any booking by id, including another user's
// contactPhone and specialRequests. This is the IDOR vulnerability named in
// PROJECT_GUIDE.md's pentest plan, kept unfixed on purpose for before/after
// evidence. Fixed in a dedicated commit on Day 5 — do not "clean this up"
// without checking that plan first.
export async function getBookingById(id: string) {
    if (!isValidObjectId(id)) {
        throw new AppError('Booking not found', 404);
    }

    const booking = await bookingRepository.findById(id);
    if (!booking) {
        throw new AppError('Booking not found', 404);
    }
    return booking;
}

export async function getMyBookings(userId: string) {
    return bookingRepository.findByUser(userId);
}

export async function getAllBookings() {
    return bookingRepository.findAll();
}

export async function cancelBooking(
    id: string,
    requester: { sub: string; role: 'user' | 'admin' },
    ipAddress: string
) {
    if (!isValidObjectId(id)) {
        throw new AppError('Booking not found', 404);
    }

    const booking = await bookingRepository.findById(id);
    if (!booking) {
        throw new AppError('Booking not found', 404);
    }

    if (booking.userId.toString() !== requester.sub && requester.role !== 'admin') {
        throw new AppError('Booking not found', 404);
    }

    if (booking.status === 'cancelled' || booking.status === 'completed' || booking.status === 'rejected') {
        throw new AppError(`Cannot cancel a booking that is already ${booking.status}`, 400);
    }

    const updated = await bookingRepository.updateStatus(id, 'cancelled', booking.decidedBy?.toString() ?? null);

    await logActivity({
        userId: requester.sub,
        action: 'booking_cancelled',
        targetType: 'Booking',
        targetId: id,
        ipAddress,
    });

    return updated!;
}

export async function decideBooking(id: string, input: DecisionInput, adminId: string, ipAddress: string) {
    if (!isValidObjectId(id)) {
        throw new AppError('Booking not found', 404);
    }

    const booking = await bookingRepository.findById(id);
    if (!booking) {
        throw new AppError('Booking not found', 404);
    }

    if (booking.status !== 'pending') {
        throw new AppError(`Cannot decide a booking that is already ${booking.status}`, 400);
    }

    const updated = await bookingRepository.updateStatus(id, input.decision, adminId);

    await logActivity({
        userId: adminId,
        action: input.decision === 'confirmed' ? 'booking_approved' : 'booking_rejected',
        targetType: 'Booking',
        targetId: id,
        ipAddress,
    });

    return updated!;
}
