import { Request, Response } from 'express';
import { listActivity } from '../services/activityLog.service';

export async function list(_req: Request, res: Response) {
    const logs = await listActivity();
    res.status(200).json({
        logs: logs.map((log) => ({
            id: log.id,
            userId: log.userId,
            action: log.action,
            targetType: log.targetType,
            targetId: log.targetId,
            ipAddress: log.ipAddress,
            timestamp: log.timestamp,
            metadata: log.metadata,
        })),
    });
}
