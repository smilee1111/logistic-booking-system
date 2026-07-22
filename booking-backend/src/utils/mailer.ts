import nodemailer from 'nodemailer';
import { EMAIL_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '../config';

// A single shared transport, not one per send — Nodemailer pools/reuses the
// underlying SMTP connection internally.
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // implicit TLS on 465; STARTTLS is negotiated automatically on 587
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
});

interface SendMailInput {
    to: string;
    subject: string;
    text: string;
}

// Deliberately takes structured fields (to/subject/text) rather than a
// pre-built message string — Nodemailer handles header encoding for each
// field independently, so there's no path for a value containing CRLF
// sequences to inject extra headers or split into a second message.
export async function sendMail({ to, subject, text }: SendMailInput): Promise<void> {
    await transporter.sendMail({ from: EMAIL_FROM, to, subject, text });
}
