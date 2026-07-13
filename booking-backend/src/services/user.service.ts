import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { logActivity } from './activityLog.service';
import { UpdateMeInput } from '../validators/user.validator';

export async function getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
}

export async function updateOwnProfile(id: string, data: UpdateMeInput) {
    const user = await userRepository.updateById(id, data);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
}

export async function listAllUsers() {
    return userRepository.list();
}

export async function changeUserRole(
    targetUserId: string,
    role: 'user' | 'admin',
    actingAdminId: string,
    ipAddress: string
) {
    if (targetUserId === actingAdminId) {
        throw new AppError('You cannot change your own role', 400);
    }

    const user = await userRepository.updateRole(targetUserId, role);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    await logActivity({
        userId: actingAdminId,
        action: 'role_changed',
        targetType: 'User',
        targetId: targetUserId,
        ipAddress,
        metadata: { newRole: role },
    });

    return user;
}
