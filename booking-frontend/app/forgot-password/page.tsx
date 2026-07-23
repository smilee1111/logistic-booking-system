'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, MailQuestion } from 'lucide-react';
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
                <div className="card w-full max-w-sm space-y-4 p-8 text-center">
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-(--success-bg) text-(--success)">
                        <MailCheck className="h-5 w-5" />
                    </span>
                    <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                    <p className="text-sm text-(--muted)">
                        If that email is registered, we&apos;ve sent a link to reset your password.
                    </p>
                    <Link href="/login" className="link text-sm">
                        Back to login
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <div className="card w-full max-w-sm space-y-6 p-8">
                <div className="space-y-1.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
                        <MailQuestion className="h-5 w-5" />
                    </span>
                    <h1 className="pt-1 text-2xl font-semibold tracking-tight">Forgot password</h1>
                    <p className="text-sm text-(--muted)">
                        Enter your account email and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <input id="email" type="email" autoComplete="email" className="input" {...register('email')} />
                        {errors.email && <p className="text-sm text-(--danger)">{errors.email.message}</p>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                        {isSubmitting ? 'Sending…' : 'Send reset link'}
                    </button>
                </form>

                <p className="text-sm text-(--muted)">
                    <Link href="/login" className="link">
                        Back to login
                    </Link>
                </p>
            </div>
        </main>
    );
}
