import { resourceRepository } from '../repositories/resource.repository';
import { AppError } from '../utils/AppError';
import { isValidObjectId } from '../utils/objectId';
import { logActivity } from './activityLog.service';
import { CreateResourceInput, UpdateResourceInput } from '../validators/resource.validator';

export async function createResource(input: CreateResourceInput, createdBy: string, ipAddress: string) {
    const resource = await resourceRepository.create({ ...input, createdBy });

    await logActivity({
        userId: createdBy,
        action: 'resource_created',
        targetType: 'Resource',
        targetId: resource.id,
        ipAddress,
    });

    return resource;
}

export async function getResourceById(id: string) {
    if (!isValidObjectId(id)) {
        throw new AppError('Resource not found', 404);
    }

    const resource = await resourceRepository.findById(id);
    if (!resource) {
        throw new AppError('Resource not found', 404);
    }
    return resource;
}

export async function listResources() {
    return resourceRepository.list();
}

export async function updateResource(id: string, input: UpdateResourceInput, updatedBy: string, ipAddress: string) {
    if (!isValidObjectId(id)) {
        throw new AppError('Resource not found', 404);
    }

    const resource = await resourceRepository.updateById(id, input);
    if (!resource) {
        throw new AppError('Resource not found', 404);
    }

    await logActivity({
        userId: updatedBy,
        action: 'resource_updated',
        targetType: 'Resource',
        targetId: resource.id,
        ipAddress,
        metadata: { updatedFields: Object.keys(input) },
    });

    return resource;
}

export async function deleteResource(id: string, deletedBy: string, ipAddress: string) {
    if (!isValidObjectId(id)) {
        throw new AppError('Resource not found', 404);
    }

    const resource = await resourceRepository.deleteById(id);
    if (!resource) {
        throw new AppError('Resource not found', 404);
    }

    await logActivity({
        userId: deletedBy,
        action: 'resource_deleted',
        targetType: 'Resource',
        targetId: resource.id,
        ipAddress,
        metadata: { name: resource.name },
    });
}
