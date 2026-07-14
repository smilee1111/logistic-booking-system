import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';
import { userRepository } from '../repositories/user.repository';
import { decryptSecret, encryptSecret } from '../utils/mfaEncryption';
import { generateBackupCodes, hashBackupCodes, verifyAndConsumeBackupCode } from '../utils/backupCodes';
import { AppError } from '../utils/AppError';
import { VerifyMfaInput } from '../validators/mfa.validator';

const ISSUER = 'Lab & Equipment Booking';

export async function setupMfa(userId: string, userEmail: string) {
    const secret = generateSecret();
    await userRepository.setMfaSecret(userId, encryptSecret(secret));

    const otpauthUrl = generateURI({ issuer: ISSUER, label: userEmail, secret });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    return { qrCodeDataUrl, secret };
}

export async function confirmMfaSetup(userId: string, code: string) {
    const user = await userRepository.findByIdWithMfaSecrets(userId);
    if (!user || !user.mfaSecret) {
        throw new AppError('No pending MFA setup found — call mfa/setup first', 400);
    }

    const result = await verify({ token: code, secret: decryptSecret(user.mfaSecret) });
    if (!result.valid) {
        throw new AppError('Invalid authentication code', 400);
    }

    const backupCodes = generateBackupCodes();
    const hashes = await hashBackupCodes(backupCodes);
    await userRepository.enableMfa(userId, hashes);

    return { backupCodes };
}

// Used both by the login-time MFA challenge and (in principle) any future re-auth flow.
export async function verifyMfaChallenge(userId: string, input: VerifyMfaInput) {
    const user = await userRepository.findByIdWithMfaSecrets(userId);
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
        throw new AppError('MFA is not enabled for this account', 400);
    }

    if (input.code) {
        const result = await verify({ token: input.code, secret: decryptSecret(user.mfaSecret) });
        if (!result.valid) {
            throw new AppError('Invalid authentication code', 401);
        }
        return user;
    }

    const { valid, remainingHashes } = await verifyAndConsumeBackupCode(
        input.backupCode as string,
        user.mfaBackupCodeHashes
    );
    if (!valid) {
        throw new AppError('Invalid backup code', 401);
    }
    await userRepository.updateBackupCodeHashes(userId, remainingHashes);

    return user;
}
