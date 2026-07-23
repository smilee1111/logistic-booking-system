'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, LayoutDashboard, ScrollText, UsersRound, Wrench } from 'lucide-react';

const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/resources', label: 'Resources', icon: Wrench },
    { href: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
    { href: '/admin/users', label: 'Users', icon: UsersRound },
    { href: '/admin/logs', label: 'Activity Logs', icon: ScrollText },
];

export function AdminNav() {
    const pathname = usePathname();

    return (
        <div className="border-b border-(--border) bg-(--surface)">
            <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 py-2.5 text-sm">
                {links.map(({ href, label, icon: Icon, exact }) => {
                    const active = exact ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                                active
                                    ? 'bg-(--primary)/10 font-medium text-(--primary)'
                                    : 'text-(--muted) hover:bg-black/[0.04] hover:text-(--foreground) dark:hover:bg-white/[0.06]'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
