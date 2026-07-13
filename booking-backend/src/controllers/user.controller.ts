import { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import { updateMeSchema, updateRoleSchema } from '../validators/user.validator';
import { changeUserRole, getUserById, listAllUsers, updateOwnProfile } from '../services/user.service';
import type { IUser } from '../models/User';
import { AppError } from '../utils/AppError';

function toPublicUser(user: HydratedDocument<IUser>) {
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
        phoneNumber: user.phoneNumber,
        mfaEnabled: user.mfaEnabled,
    };
}

export async function getMe(req: Request, res: Response) {
    const user = await getUserById(req.user!.sub);
    res.status(200).json({ user: toPublicUser(user) });
}

export async function updateMe(req: Request, res: Response) {
    const input = updateMeSchema.parse(req.body);
    const user = await updateOwnProfile(req.user!.sub, input);
    res.status(200).json({ user: toPublicUser(user) });
}

export async function listUsers(_req: Request, res: Response) {
    const users = await listAllUsers();
    res.status(200).json({ users: users.map(toPublicUser) });
}

export async function updateRole(req: Request, res: Response) {
    const { role } = updateRoleSchema.parse(req.body);
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new AppError('Invalid user id', 400);
    }
    const user = await changeUserRole(id, role, req.user!.sub, req.ip ?? 'unknown');
    res.status(200).json({ user: toPublicUser(user) });
}
