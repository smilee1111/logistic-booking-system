'use client';

import { useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';
import { loginSchema, type LoginFormValues } from '@/lib/validators/auth';
import { loginAction, verifyMfaLoginAction } from '@/app/actions/auth';
import { useAuth } from '@/context/AuthContext';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [formError, setFormError] = useState<string | null>(null);
    const [captchaKey, setCaptchaKey] = useState(0);
    const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
    const [mfaInput, setMfaInput] = useState('');
    const [mfaError, setMfaError] = useState<string | null>(null);
    const [mfaSubmitting, setMfaSubmitting] = useState(false);

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

        if (result.mfaRequired) {
            setStep('mfa');
            return;
        }

        setUser(result.user ?? null);
        router.push('/');
    }

    async function onSubmitMfa(e: SubmitEvent) {
        e.preventDefault();
        setMfaError(null);
        setMfaSubmitting(true);

        // A 6-digit numeric entry is treated as a TOTP code, anything else as a backup code.
        const input = /^\d{6}$/.test(mfaInput) ? { code: mfaInput } : { backupCode: mfaInput };
        const result = await verifyMfaLoginAction(input);

        setMfaSubmitting(false);

        if (!result.success) {
            setMfaError(result.message ?? 'Verification failed');
            return;
        }

        setUser(result.user ?? null);
        router.push('/');
    }

    if (step === 'mfa') {
        return (
            <main className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-sm space-y-6">
                    <h1 className="text-2xl font-semibold tracking-tight">Two-factor verification</h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Enter the 6-digit code from your authenticator app, or one of your backup codes.
                    </p>

                    <form onSubmit={onSubmitMfa} className="space-y-4" noValidate>
                        <div className="space-y-1">
                            <label htmlFor="mfaInput" className="text-sm font-medium">
                                Code
                            </label>
                            <input
                                id="mfaInput"
                                type="text"
                                autoComplete="one-time-code"
                                value={mfaInput}
                                onChange={(e) => setMfaInput(e.target.value)}
                                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            />
                        </div>

                        {mfaError && <p className="text-sm text-red-600">{mfaError}</p>}

                        <button
                            type="submit"
                            disabled={mfaSubmitting}
                            className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
                        >
                            {mfaSubmitting ? 'Verifying…' : 'Verify'}
                        </button>
                    </form>
                </div>
            </main>
        );
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
