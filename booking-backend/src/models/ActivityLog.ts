import mongoose, { Document, Model, Schema } from 'mongoose';

export type ActivityAction =
    | 'login'
    | 'login_failed'
    | 'booking_created'
    | 'booking_approved'
    | 'booking_rejected'
    | 'booking_cancelled'
    | 'resource_created'
    | 'resource_updated'
    | 'resource_deleted'
    | 'role_changed'
    | 'password_reset_requested'
    | 'password_reset_completed';

export interface IActivityLog extends Document {
    userId: mongoose.Types.ObjectId | null;
    action: ActivityAction;
    targetType: string;
    targetId: mongoose.Types.ObjectId | null;
    ipAddress: string;
    timestamp: Date;
    metadata: Record<string, unknown>;
}

const activityLogSchema = new Schema<IActivityLog>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    action: {
        type: String,
        required: true,
        enum: [
            'login',
            'login_failed',
            'booking_created',
            'booking_approved',
            'booking_rejected',
            'booking_cancelled',
            'resource_created',
            'resource_updated',
            'resource_deleted',
            'role_changed',
            'password_reset_requested',
            'password_reset_completed',
        ],
    },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId, default: null },
    ipAddress: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    // Action + target only — never store passwords, tokens, or raw request bodies here.
    metadata: { type: Schema.Types.Mixed, default: {} },
});

export const ActivityLog: Model<IActivityLog> = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
