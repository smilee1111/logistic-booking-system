import { MFA_ENCRYPTION_KEY } from '../config';
import { decrypt, encrypt } from './encryption';

export function encryptSecret(plaintext: string): string {
    return encrypt(plaintext, MFA_ENCRYPTION_KEY);
}

export function decryptSecret(ciphertext: string): string {
    return decrypt(ciphertext, MFA_ENCRYPTION_KEY);
}
