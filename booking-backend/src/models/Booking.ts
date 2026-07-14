import mongoose, { Document, Model, Schema } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';

export interface IBooking extends Document {
    userId: mongoose.Types.ObjectId;
    resourceId: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    status: BookingStatus;
    specialRequests: string;
    contactPhone: string;
    decidedBy: mongoose.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        resourceId: { type: Schema.Types.ObjectId, ref: 'Resource', required: true, index: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
            default: 'pending',
        },
        // Stored as submitted, not sanitized — see PROJECT_GUIDE.md's pentest plan.
        // This is the deliberate stored-XSS surface for Day 5's before/after evidence.
        specialRequests: { type: String, default: '', trim: true },
        contactPhone: { type: String, required: true, select: false },
        decidedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },
    { timestamps: true }
);

// Backstop against literal duplicate double-submits only — NOT a general overlap
// solution (two bookings for the same resource with different but overlapping
// start/end times won't collide on this index). The real overlap check is a
// check-then-insert query in booking.service.ts. This MongoDB deployment is
// standalone (no replica set), so true multi-document transactions aren't
// available; given this is a low-concurrency university booking system rather
// than a high-traffic or financial one, the small theoretical race window
// between that check and the insert is an accepted, documented limitation.
bookingSchema.index(
    { resourceId: 1, startTime: 1, endTime: 1 },
    { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } }
);

export const Booking: Model<IBooking> = mongoose.model<IBooking>('Booking', bookingSchema);
