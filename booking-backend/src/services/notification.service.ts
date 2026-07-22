import { userRepository } from '../repositories/user.repository';
import { sendMail } from '../utils/mailer';

// Stubbed third-party integration (PROJECT_GUIDE.md's "secure transactions"
// evidence — a real deployment would call an email/calendar provider here).
// Deliberately best-effort and never awaited by the caller: a notification
// provider failing or being slow must never roll back or delay the booking
// itself, which is the actual source of truth, not this side effect.
export async function sendBookingConfirmationStub(userId: string, bookingId: string): Promise<void> {
    try {
        const user = await userRepository.findById(userId);
        if (!user) return;

        console.log(
            `[stub:notification] Would send confirmation email + calendar invite to ${user.email} for booking ${bookingId}`
        );
    } catch (error) {
        console.error('[stub:notification] Failed to send booking confirmation (non-fatal):', error);
    }
}

// A real send, unlike the booking confirmation above — this is the actual
// delivery mechanism for the reset link, not a nice-to-have side effect.
// Still never throws: a transient SMTP failure must never surface as an error
// to the caller, both because that would leak account-existence information
// through response timing/shape, and because a delivery hiccup shouldn't make
// the request itself fail when the token was already issued and stored.
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    try {
        await sendMail({
            to: email,
            subject: 'Reset your password',
            text: `We received a request to reset your password.\n\nReset it here (expires in 30 minutes): ${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`,
        });
    } catch (error) {
        console.error('[notification] Failed to send password reset email (non-fatal):', error);
    }
}
