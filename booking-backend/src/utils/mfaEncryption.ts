import crypto from 'crypto';
import { MFA_ENCRYPTION_KEY } from '../config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey(): Buffer {
    return Buffer.from(MFA_ENCRYPTION_KEY, 'hex');
}

// Stored as iv:authTag:ciphertext (all hex) so a single string column holds everything
// needed to decrypt — no separate column to keep in sync.
export function encryptSecret(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decryptSecret(ciphertext: string): string {
    const [ivHex, authTagHex, dataHex] = ciphertext.split(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
}
