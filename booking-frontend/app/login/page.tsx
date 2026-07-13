'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import { loginSchema, type LoginFormValues } from '@/lib/validators/auth';
import { loginAction } from '@/app/actions/auth';
import { useAuth } from '@/context/AuthContext';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [formError, setFormError] = useState<string | null>(null);
    const [captchaKey, setCaptchaKey] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

    async function onSubmit(values: LoginFormValues) {
        setFormError(null);
        const result = await loginAction(values);

        setCaptchaKey((key) => key + 1);
        setValue('captchaToken', '');

        if (!result.success) {
            setFormError(result.message ?? 'Login failed');
            return;
        }

        setUser(result.user ?? null);
        router.push('/');
    }

    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>

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

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            {...register('password')}
                        />
                        {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <input type="hidden" {...register('captchaToken')} />
                        <ReCAPTCHA
                            key={captchaKey}
                            sitekey={RECAPTCHA_SITE_KEY}
                            onChange={(token) => setValue('captchaToken', token ?? '', { shouldValidate: true })}
                            onExpired={() => setValue('captchaToken', '', { shouldValidate: true })}
                        />
                        {errors.captchaToken && (
                            <p className="text-sm text-red-600">{errors.captchaToken.message}</p>
                        )}
                    </div>

                    {formError && <p className="text-sm text-red-600">{formError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
                    >
                        {isSubmitting ? 'Logging in…' : 'Log in'}
                    </button>
                </form>

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="underline">
                        Register
                    </Link>
                </p>
            </div>
        </main>
    );
}
