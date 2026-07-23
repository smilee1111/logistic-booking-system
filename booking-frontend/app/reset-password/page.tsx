'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, KeyRound, TriangleAlert } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validators/auth';
import { resetPasswordAction } from '@/app/actions/auth';

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [formError, setFormError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

    async function onSubmit(values: ResetPasswordFormValues) {
        setFormError(null);

        if (!token) {
            setFormError('This reset link is missing its token — please request a new one.');
            return;
        }

        const result = await resetPasswordAction(token, values.password);

        if (!result.success) {
            setFormError(result.message ?? 'Failed to reset password');
            return;
        }

        setDone(true);
        setTimeout(() => router.push('/login'), 2000);
    }

    if (!token) {
        return (
            <main className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="card w-full max-w-sm space-y-4 p-8 text-center">
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-(--danger-bg) text-(--danger)">
                        <TriangleAlert className="h-5 w-5" />
                    </span>
                    <h1 className="text-2xl font-semibold tracking-tight">Invalid reset link</h1>
                    <p className="text-sm text-(--muted)">
                        This link is missing its token.{' '}
                        <Link href="/forgot-password" className="link">
                            Request a new one
                        </Link>
                        .
                    </p>
                </div>
            </main>
        );
    }

    if (done) {
        return (
            <main className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="card w-full max-w-sm space-y-4 p-8 text-center">
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-(--success-bg) text-(--success)">
                        <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <h1 className="text-2xl font-semibold tracking-tight">Password reset</h1>
                    <p className="text-sm text-(--muted)">Redirecting you to log in…</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <div className="card w-full max-w-sm space-y-6 p-8">
                <div className="space-y-1.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
                        <KeyRound className="h-5 w-5" />
                    </span>
                    <h1 className="pt-1 text-2xl font-semibold tracking-tight">Reset password</h1>
                    <p className="text-sm text-(--muted)">Enter a new password for your account.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium">
                            New password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className="input"
                            {...register('password')}
                        />
                        {errors.password && <p className="text-sm text-(--danger)">{errors.password.message}</p>}
                        <p className="text-xs text-(--muted)">
                            At least 10 characters, with uppercase, lowercase, a number, and a symbol.
                        </p>
                    </div>

                    {formError && (
                        <p className="rounded-lg bg-(--danger-bg) px-3 py-2 text-sm text-(--danger)">{formError}</p>
                    )}

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                        {isSubmitting ? 'Resetting…' : 'Reset password'}
                    </button>
                </form>
            </div>
        </main>
    );
}
