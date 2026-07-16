import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
        redirect('/');
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="border-b border-black/10 px-6 py-3 dark:border-white/10">
                <nav className="flex gap-4 text-sm">
                    <Link href="/admin" className="hover:underline">
                        Dashboard
                    </Link>
                    <Link href="/admin/resources" className="hover:underline">
                        Resources
                    </Link>
                    <Link href="/admin/bookings" className="hover:underline">
                        Bookings
                    </Link>
                    <Link href="/admin/users" className="hover:underline">
                        Users
                    </Link>
                    <Link href="/admin/logs" className="hover:underline">
                        Activity Logs
                    </Link>
                </nav>
            </div>
            {children}
        </div>
    );
}
