'use client';

import Link from 'next/link';
import { FlaskConical, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logoutAction } from '@/app/actions/auth';

const navLinkClass =
    'rounded-lg px-3 py-1.5 text-sm text-(--muted) transition-colors hover:bg-black/[0.04] hover:text-(--foreground) dark:hover:bg-white/[0.06]';

export function Nav() {
    const { user } = useAuth();

    return (
        <nav className="sticky top-0 z-10 border-b border-(--border) bg-(--surface)/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
                <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--primary) text-(--primary-foreground)">
                        <FlaskConical className="h-4.5 w-4.5" />
                    </span>
                    Bookio
                </Link>
                <div className="flex items-center gap-1">
                    <Link href="/resources" className={navLinkClass}>
                        Resources
                    </Link>
                    {user ? (
                        <>
                            <Link href="/bookings" className={navLinkClass}>
                                My Bookings
                            </Link>
                            <Link href="/settings/mfa" className={navLinkClass}>
                                Two-factor auth
                            </Link>
                            {user.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-(--primary) transition-colors hover:bg-(--primary)/10"
                                >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Admin
                                </Link>
                            )}

                            <div className="ml-2 flex items-center gap-2 border-l border-(--border) pl-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-(--primary)/15 text-xs font-semibold text-(--primary)">
                                    {user.fullName.charAt(0).toUpperCase()}
                                </span>
                                <span className="hidden text-sm text-(--muted) sm:inline">{user.fullName}</span>
                                <form action={logoutAction}>
                                    <button
                                        type="submit"
                                        title="Logout"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-(--muted) transition-colors hover:bg-black/[0.04] hover:text-(--danger) dark:hover:bg-white/[0.06]"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={navLinkClass}>
                                Login
                            </Link>
                            <Link href="/register" className="btn btn-primary ml-1">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
