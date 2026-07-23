import { ShieldCheck } from 'lucide-react';
import { changeUserRoleAction, getAllUsersAction } from '@/app/actions/admin/users';
import { getCurrentUser } from '@/lib/session';

export default async function AdminUsersPage() {
    const [users, currentUser] = await Promise.all([getAllUsersAction(), getCurrentUser()]);

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-3xl space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">Users</h1>

                <ul className="space-y-3">
                    {users.map((user) => {
                        const isSelf = user.id === currentUser?.id;
                        const nextRole = user.role === 'admin' ? 'user' : 'admin';
                        return (
                            <li key={user.id} className="card flex items-center justify-between gap-4 p-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{user.fullName}</span>
                                        <span className={`badge ${user.role === 'admin' ? 'badge-info' : 'badge-neutral'}`}>
                                            {user.role === 'admin' && <ShieldCheck className="h-3 w-3" />}
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-sm text-(--muted)">
                                        {user.email} · @{user.username}
                                    </p>
                                </div>
                                <form action={changeUserRoleAction.bind(null, user.id, nextRole)}>
                                    <button
                                        type="submit"
                                        disabled={isSelf}
                                        className="btn btn-secondary px-3 py-1.5 text-xs"
                                        title={isSelf ? "You can't change your own role" : undefined}
                                    >
                                        Make {nextRole}
                                    </button>
                                </form>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </main>
    );
}
