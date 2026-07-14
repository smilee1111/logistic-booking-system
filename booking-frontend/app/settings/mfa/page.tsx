'use client';

import { useState, type SubmitEvent } from 'react';
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
            <div className="w-full max-w-md space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">Two-factor authentication</h1>

                {phase === 'idle' && (
                    <div className="space-y-4">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Add an extra layer of security to your account using an authenticator app.
                        </p>
                        <button
                            onClick={startSetup}
                            disabled={loading}
                            className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
                        >
                            {loading ? 'Starting…' : 'Set up two-factor authentication'}
                        </button>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                )}

                {phase === 'scanning' && (
                    <form onSubmit={confirmSetup} className="space-y-4">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.),
                            then enter the 6-digit code it shows.
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image can't optimize it */}
                        <img src={qrCodeDataUrl} alt="MFA QR code" className="mx-auto h-48 w-48" />
                        <p className="break-all text-center text-xs text-zinc-500">
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
                                className="w-full rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
                        >
                            {loading ? 'Verifying…' : 'Confirm'}
                        </button>
                    </form>
                )}

                {phase === 'complete' && (
                    <div className="space-y-4">
                        <p className="text-sm text-green-600">Two-factor authentication is now enabled.</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Save these backup codes somewhere safe. Each one can be used once if you lose access
                            to your authenticator app. They won&apos;t be shown again.
                        </p>
                        <ul className="grid grid-cols-2 gap-2 rounded-md border border-black/10 p-4 font-mono text-sm dark:border-white/15">
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
