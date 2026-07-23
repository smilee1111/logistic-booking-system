import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
        redirect('/');
    }

    return (
        <div className="flex flex-1 flex-col">
            <AdminNav />
            {children}
        </div>
    );
}
