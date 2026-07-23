'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
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
            <div className="card w-full max-w-sm space-y-6 p-8">
                <div className="space-y-1.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
                        <UserPlus className="h-5 w-5" />
                    </span>
                    <h1 className="pt-1 text-2xl font-semibold tracking-tight">Create an account</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="space-y-1">
                        <label htmlFor="fullName" className="text-sm font-medium">
                            Full name
                        </label>
                        <input id="fullName" type="text" autoComplete="name" className="input" {...register('fullName')} />
                        {errors.fullName && <p className="text-sm text-(--danger)">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <input id="email" type="email" autoComplete="email" className="input" {...register('email')} />
                        {errors.email && <p className="text-sm text-(--danger)">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="username" className="text-sm font-medium">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            className="input"
                            {...register('username')}
                        />
                        {errors.username && <p className="text-sm text-(--danger)">{errors.username.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="phoneNumber" className="text-sm font-medium">
                            Phone number
                        </label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            autoComplete="tel"
                            className="input"
                            {...register('phoneNumber')}
                        />
                        {errors.phoneNumber && <p className="text-sm text-(--danger)">{errors.phoneNumber.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
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
                        {isSubmitting ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="text-sm text-(--muted)">
                    Already have an account?{' '}
                    <Link href="/login" className="link">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}
