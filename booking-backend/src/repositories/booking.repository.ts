import { Booking, BookingStatus } from '../models/Booking';

interface BookingCreateData {
    userId: string;
    resourceId: string;
    startTime: Date;
    endTime: Date;
    specialRequests: string;
    contactPhone: string;
    status: BookingStatus;
}

export const bookingRepository = {
    create(data: BookingCreateData) {
        return Booking.create(data);
    },

    // Pending bookings count as occupying the slot too — otherwise multiple
    // conflicting requests could all sit pending and later get approved into
    // a double-booking.
    findOverlapping(resourceId: string, startTime: Date, endTime: Date) {
        return Booking.findOne({
            resourceId,
            status: { $in: ['pending', 'confirmed'] },
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        });
    },

    findById(id: string) {
        return Booking.findById(id).select('+contactPhone');
    },

    findByUser(userId: string) {
        return Booking.find({ userId }).select('+contactPhone').sort({ startTime: -1 });
    },

    // Populated for the admin listing only — every other read path (findById,
    // findByUser) stays plain ObjectIds, so their response shape is unaffected.
    findAll() {
        return Booking.find()
            .select('+contactPhone')
            .populate('userId', 'fullName email')
            .populate('resourceId', 'name')
            .sort({ startTime: -1 });
    },

    updateStatus(id: string, status: BookingStatus, decidedBy: string | null) {
        return Booking.findByIdAndUpdate(id, { status, decidedBy }, { new: true }).select('+contactPhone');
    },
};
