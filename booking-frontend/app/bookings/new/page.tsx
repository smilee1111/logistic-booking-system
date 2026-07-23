'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { CalendarPlus } from 'lucide-react';
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
                <p className="text-sm text-(--muted)">
                    No resource selected. Go back to{' '}
                    <Link href="/resources" className="link">
                        Resources
                    </Link>{' '}
                    and pick one to book.
                </p>
            </main>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <div className="card w-full max-w-sm space-y-6 p-8">
                <div className="space-y-1.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
                        <CalendarPlus className="h-5 w-5" />
                    </span>
                    <h1 className="pt-1 text-2xl font-semibold tracking-tight">Book resource</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <input type="hidden" {...register('resourceId')} />

                    <div className="space-y-1">
                        <label htmlFor="startTime" className="text-sm font-medium">
                            Start time
                        </label>
                        <input id="startTime" type="datetime-local" className="input" {...register('startTime')} />
                        {errors.startTime && <p className="text-sm text-(--danger)">{errors.startTime.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="endTime" className="text-sm font-medium">
                            End time
                        </label>
                        <input id="endTime" type="datetime-local" className="input" {...register('endTime')} />
                        {errors.endTime && <p className="text-sm text-(--danger)">{errors.endTime.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="contactPhone" className="text-sm font-medium">
                            Contact phone
                        </label>
                        <input id="contactPhone" type="tel" className="input" {...register('contactPhone')} />
                        {errors.contactPhone && (
                            <p className="text-sm text-(--danger)">{errors.contactPhone.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="specialRequests" className="text-sm font-medium">
                            Special requests (optional)
                        </label>
                        <textarea id="specialRequests" rows={3} className="input" {...register('specialRequests')} />
                    </div>

                    {formError && (
                        <p className="rounded-lg bg-(--danger-bg) px-3 py-2 text-sm text-(--danger)">{formError}</p>
                    )}

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                        {isSubmitting ? 'Booking…' : 'Book'}
                    </button>
                </form>
            </div>
        </main>
    );
}
