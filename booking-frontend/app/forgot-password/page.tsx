'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validators/auth';
import { forgotPasswordAction } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

    async function onSubmit(values: ForgotPasswordFormValues) {
        // Always shows the same success state regardless of the actual result —
        // the backend already returns an identical response either way (no
        // account enumeration), so branching on it here would defeat that.
        await forgotPasswordAction(values);
        setSubmitted(true);
    }

    if (submitted) {
        return (
            <main className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-sm space-y-4 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        If that email is registered, we&apos;ve sent a link to reset your password.
                    </p>
                    <Link href="/login" className="text-sm underline">
                        Back to login
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">Forgot password</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Enter your account email and we&apos;ll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            {...register('email')}
                        />
                        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
                    >
                        {isSubmitting ? 'Sending…' : 'Send reset link'}
                    </button>
                </form>

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    <Link href="/login" className="underline">
                        Back to login
                    </Link>
                </p>
            </div>
        </main>
    );
}
