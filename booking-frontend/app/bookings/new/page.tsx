'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { createBookingSchema, type CreateBookingFormValues } from '@/lib/validators/booking';
import { createBookingAction } from '@/app/actions/bookings';

export default function NewBookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resourceId = searchParams.get('resourceId') ?? '';
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateBookingFormValues>({
        resolver: zodResolver(createBookingSchema),
        defaultValues: { resourceId, specialRequests: '' },
    });

    async function onSubmit(values: CreateBookingFormValues) {
        setFormError(null);
        const result = await createBookingAction({
            resourceId: values.resourceId,
            startTime: new Date(values.startTime).toISOString(),
            endTime: new Date(values.endTime).toISOString(),
            specialRequests: values.specialRequests,
            contactPhone: values.contactPhone,
        });

        if (!result.success) {
            setFormError(result.message ?? 'Failed to create booking');
            return;
        }

        router.push('/bookings');
    }

    if (!resourceId) {
        return (
            <main className="flex flex-1 items-center justify-center px-6 py-16">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    No resource selected. Go back to{' '}
                    <Link href="/resources" className="underline">
                        Resources
                    </Link>{' '}
                    and pick one to book.
                </p>
            </main>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">Book resource</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <input type="hidden" {...register('resourceId')} />

                    <div className="space-y-1">
                        <label htmlFor="startTime" className="text-sm font-medium">
                            Start time
                        </label>
                        <input
                            id="startTime"
                            type="datetime-local"
                            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            {...register('startTime')}
                        />
                        {errors.startTime && <p className="text-sm text-red-600">{errors.startTime.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="endTime" className="text-sm font-medium">
                            End time
                        </label>
                        <input
                            id="endTime"
                            type="datetime-local"
                            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            {...register('endTime')}
                        />
                        {errors.endTime && <p className="text-sm text-red-600">{errors.endTime.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="contactPhone" className="text-sm font-medium">
                            Contact phone
                        </label>
                        <input
                            id="contactPhone"
                            type="tel"
                            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            {...register('contactPhone')}
                        />
                        {errors.contactPhone && (
                            <p className="text-sm text-red-600">{errors.contactPhone.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="specialRequests" className="text-sm font-medium">
                            Special requests (optional)
                        </label>
                        <textarea
                            id="specialRequests"
                            rows={3}
                            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            {...register('specialRequests')}
                        />
                    </div>

                    {formError && <p className="text-sm text-red-600">{formError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
                    >
                        {isSubmitting ? 'Booking…' : 'Book'}
                    </button>
                </form>
            </div>
        </main>
    );
}
