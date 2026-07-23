'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resourceFormSchema, type ResourceFormValues } from '@/lib/validators/resource';
import { createResourceAction, updateResourceAction } from '@/app/actions/admin/resources';

interface ResourceFormProps {
    mode: 'create' | 'edit';
    resourceId?: string;
    defaultValues?: Partial<ResourceFormValues>;
}

export function ResourceForm({ mode, resourceId, defaultValues }: ResourceFormProps) {
    const router = useRouter();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResourceFormValues>({
        resolver: zodResolver(resourceFormSchema),
        defaultValues: {
            name: '',
            description: '',
            category: 'lab',
            location: '',
            capacity: 1,
            requiresApproval: false,
            isActive: true,
            ...defaultValues,
        },
    });

    async function onSubmit(values: ResourceFormValues) {
        setFormError(null);
        const result =
            mode === 'create'
                ? await createResourceAction(values)
                : await updateResourceAction(resourceId as string, values);

        if (!result.success) {
            setFormError(result.message ?? 'Failed to save resource');
            return;
        }

        router.push('/admin/resources');
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium">
                    Name
                </label>
                <input id="name" type="text" className="input" {...register('name')} />
                {errors.name && <p className="text-sm text-(--danger)">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
                <label htmlFor="description" className="text-sm font-medium">
                    Description
                </label>
                <textarea id="description" rows={3} className="input" {...register('description')} />
                {errors.description && <p className="text-sm text-(--danger)">{errors.description.message}</p>}
            </div>

            <div className="space-y-1">
                <label htmlFor="category" className="text-sm font-medium">
                    Category
                </label>
                <select id="category" className="input" {...register('category')}>
                    <option value="lab">Lab</option>
                    <option value="equipment">Equipment</option>
                    <option value="room">Room</option>
                </select>
            </div>

            <div className="space-y-1">
                <label htmlFor="location" className="text-sm font-medium">
                    Location
                </label>
                <input id="location" type="text" className="input" {...register('location')} />
                {errors.location && <p className="text-sm text-(--danger)">{errors.location.message}</p>}
            </div>

            <div className="space-y-1">
                <label htmlFor="capacity" className="text-sm font-medium">
                    Capacity
                </label>
                <input
                    id="capacity"
                    type="number"
                    min={1}
                    className="input"
                    {...register('capacity', { valueAsNumber: true })}
                />
                {errors.capacity && <p className="text-sm text-(--danger)">{errors.capacity.message}</p>}
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="requiresApproval"
                    type="checkbox"
                    className="h-4 w-4 accent-(--primary)"
                    {...register('requiresApproval')}
                />
                <label htmlFor="requiresApproval" className="text-sm">
                    Requires admin approval
                </label>
            </div>

            <div className="flex items-center gap-2">
                <input id="isActive" type="checkbox" className="h-4 w-4 accent-(--primary)" {...register('isActive')} />
                <label htmlFor="isActive" className="text-sm">
                    Active (visible to users)
                </label>
            </div>

            {formError && (
                <p className="rounded-lg bg-(--danger-bg) px-3 py-2 text-sm text-(--danger)">{formError}</p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create resource' : 'Save changes'}
            </button>
        </form>
    );
}
