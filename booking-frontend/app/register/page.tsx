'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { registerSchema, type RegisterFormValues } from '@/lib/validators/auth';
import { registerAction } from '@/app/actions/auth';

export default function RegisterPage() {
    const router = useRouter();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

    async function onSubmit(values: RegisterFormValues) {
        setFormError(null);
        const result = await registerAction(values);

        if (!result.success) {
            if (result.fieldErrors) {
                for (const [field, messages] of Object.entries(result.fieldErrors)) {
                    if (messages?.length) {
                        setError(field as keyof RegisterFormValues, { message: messages[0] });
                    }
                }
            }
            setFormError(result.message ?? 'Registration failed');
            return;
        }

        router.push('/login?registered=1');
    }

    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="space-y-1">
                        <label htmlFor="fullName" className="text-sm font-medium">
                            Full name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            autoComplete="name"
                            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            {...register('fullName')}
                        />
                        {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
                    </div>

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

                    <div className="space-y-1">
                        <label htmlFor="username" className="text-sm font-medium">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            {...register('username')}
                        />
                        {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="phoneNumber" className="text-sm font-medium">
                            Phone number
                        </label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            autoComplete="tel"
                            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            {...register('phoneNumber')}
                        />
                        {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
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
                        {isSubmitting ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Already have an account?{' '}
                    <Link href="/login" className="underline">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}
