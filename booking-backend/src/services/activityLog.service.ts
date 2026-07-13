import mongoose from 'mongoose';
import { ActivityAction, ActivityLog } from '../models/ActivityLog';

interface LogActivityInput {
    userId?: string | null;
    action: ActivityAction;
    targetType: string;
    targetId?: string | null;
    ipAddress: string;
    metadata?: Record<string, unknown>;
}

// Best-effort — a logging failure must never break the request it's logging.
export async function logActivity(input: LogActivityInput): Promise<void> {
    try {
        await ActivityLog.create({
            userId: input.userId ? new mongoose.Types.ObjectId(input.userId) : null,
            action: input.action,
            targetType: input.targetType,
            targetId: input.targetId ? new mongoose.Types.ObjectId(input.targetId) : null,
            ipAddress: input.ipAddress,
            metadata: input.metadata ?? {},
        });
    } catch (error) {
        console.error('Failed to write activity log:', error);
    }
}
