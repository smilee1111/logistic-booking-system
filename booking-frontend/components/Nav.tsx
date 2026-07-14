'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { logoutAction } from '@/app/actions/auth';

export function Nav() {
    const { user } = useAuth();

    return (
        <nav className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10">
            <Link href="/" className="font-semibold">
                Lab &amp; Equipment Booking
            </Link>
            <div className="flex items-center gap-4 text-sm">
                <Link href="/resources" className="hover:underline">
                    Resources
                </Link>
                {user ? (
                    <>
                        <span>Hi, {user.fullName}</span>
                        <Link href="/settings/mfa" className="hover:underline">
                            Two-factor auth
                        </Link>
                        <form action={logoutAction}>
                            <button
                                type="submit"
                                className="rounded-md border border-black/10 px-3 py-1.5 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                            >
                                Logout
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="hover:underline">
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-md bg-foreground px-3 py-1.5 text-background hover:opacity-90"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
