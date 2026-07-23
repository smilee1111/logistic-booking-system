import Link from 'next/link';
import { ClipboardList, ScrollText, UsersRound, Wrench } from 'lucide-react';

const sections = [
    {
        href: '/admin/resources',
        icon: Wrench,
        title: 'Resources',
        description: 'Create, edit, and deactivate resources',
    },
    {
        href: '/admin/bookings',
        icon: ClipboardList,
        title: 'Bookings',
        description: 'Review and decide on pending bookings',
    },
    {
        href: '/admin/users',
        icon: UsersRound,
        title: 'Users',
        description: 'View users and manage roles',
    },
    {
        href: '/admin/logs',
        icon: ScrollText,
        title: 'Activity Logs',
        description: 'Audit trail of security-relevant actions',
    },
];

export default function AdminDashboardPage() {
    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-2xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
                    <p className="text-sm text-(--muted)">Manage resources, bookings, users, and audit activity.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {sections.map(({ href, icon: Icon, title, description }) => (
                        <Link key={href} href={href} className="card space-y-2 p-5 transition-shadow hover:shadow-md">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
                                <Icon className="h-4.5 w-4.5" />
                            </span>
                            <h2 className="font-medium">{title}</h2>
                            <p className="text-sm text-(--muted)">{description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
