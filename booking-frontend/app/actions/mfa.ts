'use server';

import { authenticatedBackendFetch } from '@/lib/backend';

export interface MfaSetupResult {
    success: boolean;
    message?: string;
    qrCodeDataUrl?: string;
    secret?: string;
}

export interface MfaVerifySetupResult {
    success: boolean;
    message?: string;
    backupCodes?: string[];
}

export async function setupMfaAction(): Promise<MfaSetupResult> {
    const response = await authenticatedBackendFetch('/api/auth/mfa/setup', { method: 'POST' });
    const data = await response.json();

    if (!response.ok) {
        return { success: false, message: data.message };
    }

    return { success: true, qrCodeDataUrl: data.qrCodeDataUrl, secret: data.secret };
}

export async function verifySetupAction(code: string): Promise<MfaVerifySetupResult> {
    const response = await authenticatedBackendFetch('/api/auth/mfa/verify-setup', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
    const data = await response.json();

    if (!response.ok) {
        return { success: false, message: data.message };
    }

    return { success: true, backupCodes: data.backupCodes };
}
