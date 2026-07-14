import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../config';

const BACKUP_CODE_COUNT = 10;

export function generateBackupCodes(count: number = BACKUP_CODE_COUNT): string[] {
    return Array.from({ length: count }, () => {
        const raw = crypto.randomBytes(5).toString('hex');
        return `${raw.slice(0, 5)}-${raw.slice(5)}`;
    });
}

export function hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map((code) => bcrypt.hash(code, BCRYPT_SALT_ROUNDS)));
}

// One-time use: on a match, the matching hash is removed from the returned set so
// the same backup code can't be replayed.
export async function verifyAndConsumeBackupCode(
    candidate: string,
    hashes: string[]
): Promise<{ valid: boolean; remainingHashes: string[] }> {
    for (let i = 0; i < hashes.length; i++) {
        const isMatch = await bcrypt.compare(candidate, hashes[i]);
        if (isMatch) {
            return { valid: true, remainingHashes: [...hashes.slice(0, i), ...hashes.slice(i + 1)] };
        }
    }
    return { valid: false, remainingHashes: hashes };
}
