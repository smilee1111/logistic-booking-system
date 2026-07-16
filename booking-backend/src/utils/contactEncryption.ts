import { CONTACT_ENCRYPTION_KEY } from '../config';
import { decrypt, encrypt } from './encryption';

export function encryptContactPhone(plaintext: string): string {
    return encrypt(plaintext, CONTACT_ENCRYPTION_KEY);
}

export function decryptContactPhone(ciphertext: string): string {
    return decrypt(ciphertext, CONTACT_ENCRYPTION_KEY);
}
