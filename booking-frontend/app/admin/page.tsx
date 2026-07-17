import Link from 'next/link';

export default function AdminDashboardPage() {
    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-2xl space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Link
                        href="/admin/resources"
                        className="rounded-md border border-black/10 p-4 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                    >
                        <h2 className="font-medium">Resources</h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Create, edit, and deactivate resources
                        </p>
                    </Link>
                    <Link
                        href="/admin/bookings"
                        className="rounded-md border border-black/10 p-4 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                    >
                        <h2 className="font-medium">Bookings</h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Review and decide on pending bookings
                        </p>
                    </Link>
                    <Link
                        href="/admin/users"
                        className="rounded-md border border-black/10 p-4 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                    >
                        <h2 className="font-medium">Users</h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            View users and manage roles
                        </p>
                    </Link>
                    <Link
                        href="/admin/logs"
                        className="rounded-md border border-black/10 p-4 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                    >
                        <h2 className="font-medium">Activity Logs</h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Audit trail of security-relevant actions
                        </p>
                    </Link>
                </div>
            </div>
        </main>
    );
}
