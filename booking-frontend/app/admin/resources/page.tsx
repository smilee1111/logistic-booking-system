import Link from 'next/link';
import { getResources } from '@/lib/resources';
import { deleteResourceAction } from '@/app/actions/admin/resources';

export default async function AdminResourcesPage() {
    const resources = await getResources();

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Manage resources</h1>
                    <Link
                        href="/admin/resources/new"
                        className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
                    >
                        New resource
                    </Link>
                </div>

                {resources.length === 0 ? (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">No resources yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {resources.map((resource) => (
                            <li
                                key={resource.id}
                                className="flex items-center justify-between gap-4 rounded-md border border-black/10 p-4 dark:border-white/15"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{resource.name}</span>
                                        <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs capitalize dark:bg-white/10">
                                            {resource.category}
                                        </span>
                                        {!resource.isActive && (
                                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {resource.location} · capacity {resource.capacity}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Link
                                        href={`/admin/resources/${resource.id}/edit`}
                                        className="rounded-md border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                                    >
                                        Edit
                                    </Link>
                                    <form action={deleteResourceAction.bind(null, resource.id)}>
                                        <button
                                            type="submit"
                                            className="rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                                        >
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
