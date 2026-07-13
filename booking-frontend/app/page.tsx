'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user } = useAuth();

    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Lab &amp; Equipment Booking</h1>
            {user ? (
                <p className="text-zinc-600 dark:text-zinc-400">
                    Signed in as <span className="font-medium">{user.email}</span> ({user.role})
                </p>
            ) : (
                <p className="text-zinc-600 dark:text-zinc-400">
                    <Link href="/login" className="underline">
                        Log in
                    </Link>{' '}
                    or{' '}
                    <Link href="/register" className="underline">
                        create an account
                    </Link>{' '}
                    to get started.
                </p>
            )}
        </main>
    );
}
