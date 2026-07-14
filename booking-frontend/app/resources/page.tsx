import Link from 'next/link';
import { getResources } from '@/lib/resources';

export default async function ResourcesPage() {
    const resources = await getResources();
    const activeResources = resources.filter((resource) => resource.isActive);

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-4xl space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">Resources</h1>

                {activeResources.length === 0 ? (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">No resources available yet.</p>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {activeResources.map((resource) => (
                            <li
                                key={resource.id}
                                className="space-y-2 rounded-md border border-black/10 p-4 dark:border-white/15"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h2 className="font-medium">{resource.name}</h2>
                                    <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-xs capitalize dark:bg-white/10">
                                        {resource.category}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">{resource.description}</p>
                                <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                                    <div>
                                        <dt className="inline font-medium">Location: </dt>
                                        <dd className="inline">{resource.location}</dd>
                                    </div>
                                    <div>
                                        <dt className="inline font-medium">Capacity: </dt>
                                        <dd className="inline">{resource.capacity}</dd>
                                    </div>
                                </dl>
                                {resource.requiresApproval && (
                                    <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                        Requires approval
                                    </span>
                                )}
                                <div>
                                    <Link
                                        href={`/bookings/new?resourceId=${resource.id}`}
                                        className="inline-block rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
                                    >
                                        Book
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
