import { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';
import { createResourceSchema, updateResourceSchema } from '../validators/resource.validator';
import {
    createResource,
    deleteResource,
    getResourceById,
    listResources,
    updateResource,
} from '../services/resource.service';
import { AppError } from '../utils/AppError';
import type { IResource } from '../models/Resource';

function toPublicResource(resource: HydratedDocument<IResource>) {
    return {
        id: resource.id,
        name: resource.name,
        description: resource.description,
        category: resource.category,
        location: resource.location,
        capacity: resource.capacity,
        requiresApproval: resource.requiresApproval,
        isActive: resource.isActive,
        createdBy: resource.createdBy,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
    };
}

export async function create(req: Request, res: Response) {
    const input = createResourceSchema.parse(req.body);
    const resource = await createResource(input, req.user!.sub, req.ip ?? 'unknown');
    res.status(201).json({ resource: toPublicResource(resource) });
}

export async function getOne(req: Request, res: Response) {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new AppError('Resource not found', 404);
    }
    const resource = await getResourceById(id);
    res.status(200).json({ resource: toPublicResource(resource) });
}

export async function list(_req: Request, res: Response) {
    const resources = await listResources();
    res.status(200).json({ resources: resources.map(toPublicResource) });
}

export async function update(req: Request, res: Response) {
    const input = updateResourceSchema.parse(req.body);
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new AppError('Resource not found', 404);
    }
    const resource = await updateResource(id, input, req.user!.sub, req.ip ?? 'unknown');
    res.status(200).json({ resource: toPublicResource(resource) });
}

export async function remove(req: Request, res: Response) {
    const { id } = req.params;
    if (typeof id !== 'string') {
        throw new AppError('Resource not found', 404);
    }
    await deleteResource(id, req.user!.sub, req.ip ?? 'unknown');
    res.status(204).send();
}
