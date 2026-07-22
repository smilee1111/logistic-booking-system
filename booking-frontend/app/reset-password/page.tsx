'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
                <div className="w-full max-w-sm space-y-4 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Invalid reset link</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        This link is missing its token.{' '}
                        <Link href="/forgot-password" className="underline">
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
                <div className="w-full max-w-sm space-y-4 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Password reset</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Redirecting you to log in…
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Enter a new password for your account.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium">
                            New password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            {...register('password')}
                        />
                        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                        <p className="text-xs text-zinc-500">
                            At least 10 characters, with uppercase, lowercase, a number, and a symbol.
                        </p>
                    </div>

                    {formError && <p className="text-sm text-red-600">{formError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
                    >
                        {isSubmitting ? 'Resetting…' : 'Reset password'}
                    </button>
                </form>
            </div>
        </main>
    );
}
