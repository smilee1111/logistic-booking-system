import { RECAPTCHA_SECRET_KEY } from '../config';

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export async function verifyCaptcha(token: string): Promise<boolean> {
    if (!token) return false;

    try {
        const response = await fetch(VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ secret: RECAPTCHA_SECRET_KEY, response: token }),
        });

        const data = await response.json();
        console.log('[captcha debug] siteverify response:', JSON.stringify(data));
        return data.success === true;
    } catch (error) {
        // Fail closed — if Google's API is unreachable, don't let the login through unchecked.
        console.log('[captcha debug] siteverify threw:', error);
        return false;
    }
}
