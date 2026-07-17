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
                            <li
                                key={user.id}
                                className="flex items-center justify-between gap-4 rounded-md border border-black/10 p-4 dark:border-white/15"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{user.fullName}</span>
                                        <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs capitalize dark:bg-white/10">
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {user.email} · @{user.username}
                                    </p>
                                </div>
                                <form action={changeUserRoleAction.bind(null, user.id, nextRole)}>
                                    <button
                                        type="submit"
                                        disabled={isSelf}
                                        className="rounded-md border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 disabled:opacity-40 disabled:hover:bg-transparent dark:border-white/10 dark:hover:bg-white/10"
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
