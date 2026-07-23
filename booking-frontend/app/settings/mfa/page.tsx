'use client';

import { useState, type SubmitEvent } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { setupMfaAction, verifySetupAction } from '@/app/actions/mfa';

type Phase = 'idle' | 'scanning' | 'complete';

export default function MfaSetupPage() {
    const [phase, setPhase] = useState<Phase>('idle');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    async function startSetup() {
        setError(null);
        setLoading(true);
        const result = await setupMfaAction();
        setLoading(false);

        if (!result.success || !result.qrCodeDataUrl || !result.secret) {
            setError(result.message ?? 'Failed to start MFA setup');
            return;
        }

        setQrCodeDataUrl(result.qrCodeDataUrl);
        setSecret(result.secret);
        setPhase('scanning');
    }

    async function confirmSetup(e: SubmitEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const result = await verifySetupAction(code);
        setLoading(false);

        if (!result.success || !result.backupCodes) {
            setError(result.message ?? 'Invalid code');
            return;
        }

        setBackupCodes(result.backupCodes);
        setPhase('complete');
    }

    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <div className="card w-full max-w-md space-y-6 p-8">
                <div className="space-y-1.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
                        <ShieldCheck className="h-5 w-5" />
                    </span>
                    <h1 className="pt-1 text-2xl font-semibold tracking-tight">Two-factor authentication</h1>
                </div>

                {phase === 'idle' && (
                    <div className="space-y-4">
                        <p className="text-sm text-(--muted)">
                            Add an extra layer of security to your account using an authenticator app.
                        </p>
                        <button onClick={startSetup} disabled={loading} className="btn btn-primary">
                            {loading ? 'Starting…' : 'Set up two-factor authentication'}
                        </button>
                        {error && (
                            <p className="rounded-lg bg-(--danger-bg) px-3 py-2 text-sm text-(--danger)">{error}</p>
                        )}
                    </div>
                )}

                {phase === 'scanning' && (
                    <form onSubmit={confirmSetup} className="space-y-4">
                        <p className="text-sm text-(--muted)">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.),
                            then enter the 6-digit code it shows.
                        </p>
                        <div className="rounded-xl border border-(--border) bg-white p-4">
                            {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image can't optimize it */}
                            <img src={qrCodeDataUrl} alt="MFA QR code" className="mx-auto h-44 w-44" />
                        </div>
                        <p className="break-all text-center text-xs text-(--muted)">
                            Can&apos;t scan? Enter this key manually: <span className="font-mono">{secret}</span>
                        </p>
                        <div className="space-y-1">
                            <label htmlFor="code" className="text-sm font-medium">
                                6-digit code
                            </label>
                            <input
                                id="code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="input text-center font-mono tracking-[0.3em]"
                            />
                        </div>
                        {error && (
                            <p className="rounded-lg bg-(--danger-bg) px-3 py-2 text-sm text-(--danger)">{error}</p>
                        )}
                        <button type="submit" disabled={loading} className="btn btn-primary w-full">
                            {loading ? 'Verifying…' : 'Confirm'}
                        </button>
                    </form>
                )}

                {phase === 'complete' && (
                    <div className="space-y-4">
                        <p className="flex items-center gap-2 rounded-lg bg-(--success-bg) px-3 py-2 text-sm text-(--success)">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            Two-factor authentication is now enabled.
                        </p>
                        <p className="text-sm text-(--muted)">
                            Save these backup codes somewhere safe. Each one can be used once if you lose access
                            to your authenticator app. They won&apos;t be shown again.
                        </p>
                        <ul className="grid grid-cols-2 gap-2 rounded-xl border border-(--border) bg-black/[0.02] p-4 font-mono text-sm dark:bg-white/[0.03]">
                            {backupCodes.map((backupCode) => (
                                <li key={backupCode}>{backupCode}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </main>
    );
}
