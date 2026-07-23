'use client';

import Link from 'next/link';
import { CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const features = [
    {
        icon: Sparkles,
        title: 'Instant or approved booking',
        description: 'Low-demand resources confirm instantly; high-demand ones route to an admin for approval.',
    },
    {
        icon: ShieldCheck,
        title: 'Secure by design',
        description: 'MFA, encrypted contact details, and role-based access control on every request.',
    },
    {
        icon: CalendarCheck,
        title: 'No double-booking',
        description: 'Overlapping reservations for the same resource are rejected automatically.',
    },
];

export default function Home() {
    const { user } = useAuth();

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-20">
            <div className="w-full max-w-2xl space-y-4 text-center">
                <span className="badge badge-info">Lab &amp; Equipment Booking</span>
                <h1 className="text-4xl font-semibold tracking-tight text-balance">
                    Reserve labs and equipment without the back-and-forth
                </h1>

                {user ? (
                    <div className="space-y-5 pt-2">
                        <p className="text-(--muted)">
                            Signed in as <span className="font-medium text-(--foreground)">{user.email}</span>{' '}
                            <span className="badge badge-neutral align-middle">{user.role}</span>
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link href="/resources" className="btn btn-primary">
                                Browse resources
                            </Link>
                            <Link href="/bookings" className="btn btn-secondary">
                                My bookings
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-(--muted)">
                            Book a room or piece of equipment in seconds, with real-time conflict checking and
                            admin oversight where it matters.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <Link href="/register" className="btn btn-primary">
                                Create an account
                            </Link>
                            <Link href="/login" className="btn btn-secondary">
                                Log in
                            </Link>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
                {features.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="card space-y-2 p-5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
                            <Icon className="h-4.5 w-4.5" />
                        </span>
                        <h2 className="font-medium">{title}</h2>
                        <p className="text-sm text-(--muted)">{description}</p>
                    </div>
                ))}
            </div>
        </main>
    );
}
