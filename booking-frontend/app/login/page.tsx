'use client';

import { Suspense, useState, type SubmitEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { KeyRound, ShieldCheck } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { loginSchema, type LoginFormValues } from '@/lib/validators/auth';
import { loginAction, verifyMfaLoginAction } from '@/app/actions/auth';
import { useAuth } from '@/context/AuthContext';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useAuth();
    // The Google OAuth callback route redirects here (not a client-side action),
    // so it communicates outcome via query params instead of a return value —
    // read once as the initial state rather than synced in via an effect.
    const [formError, setFormError] = useState<string | null>(() =>
        searchParams.get('error') === 'oauth_failed' ? 'Google sign-in failed. Please try again.' : null,
    );
    const [captchaKey, setCaptchaKey] = useState(0);
    const [step, setStep] = useState<'credentials' | 'mfa'>(() =>
        searchParams.get('mfaRequired') === '1' ? 'mfa' : 'credentials',
    );
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
                <div className="card w-full max-w-sm space-y-6 p-8">
                    <div className="space-y-1.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
                            <ShieldCheck className="h-5 w-5" />
                        </span>
                        <h1 className="pt-1 text-2xl font-semibold tracking-tight">Two-factor verification</h1>
                        <p className="text-sm text-(--muted)">
                            Enter the 6-digit code from your authenticator app, or one of your backup codes.
                        </p>
                    </div>

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
                                className="input"
                            />
                        </div>

                        {mfaError && (
                            <p className="rounded-lg bg-(--danger-bg) px-3 py-2 text-sm text-(--danger)">
                                {mfaError}
                            </p>
                        )}

                        <button type="submit" disabled={mfaSubmitting} className="btn btn-primary w-full">
                            {mfaSubmitting ? 'Verifying…' : 'Verify'}
                        </button>
                    </form>
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
                    <h1 className="pt-1 text-2xl font-semibold tracking-tight">Log in</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <input id="email" type="email" autoComplete="email" className="input" {...register('email')} />
                        {errors.email && <p className="text-sm text-(--danger)">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Link href="/forgot-password" className="link text-xs">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            className="input"
                            {...register('password')}
                        />
                        {errors.password && <p className="text-sm text-(--danger)">{errors.password.message}</p>}
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
                            <p className="text-sm text-(--danger)">{errors.captchaToken.message}</p>
                        )}
                    </div>

                    {formError && (
                        <p className="rounded-lg bg-(--danger-bg) px-3 py-2 text-sm text-(--danger)">{formError}</p>
                    )}

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                        {isSubmitting ? 'Logging in…' : 'Log in'}
                    </button>
                </form>

                <div className="flex items-center gap-3 text-xs text-(--muted)">
                    <div className="h-px flex-1 bg-(--border)" />
                    or
                    <div className="h-px flex-1 bg-(--border)" />
                </div>

                <a href="/api/auth/google" className="btn btn-secondary w-full">
                    Sign in with Google
                </a>

                <p className="text-sm text-(--muted)">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="link">
                        Register
                    </Link>
                </p>
            </div>
        </main>
    );
}
