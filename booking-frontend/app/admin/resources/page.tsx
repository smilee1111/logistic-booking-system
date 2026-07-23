import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { getResources } from '@/lib/resources';
import { deleteResourceAction } from '@/app/actions/admin/resources';

export default async function AdminResourcesPage() {
    const resources = await getResources();

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Manage resources</h1>
                    <Link href="/admin/resources/new" className="btn btn-primary">
                        <Plus className="h-4 w-4" />
                        New resource
                    </Link>
                </div>

                {resources.length === 0 ? (
                    <p className="text-sm text-(--muted)">No resources yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {resources.map((resource) => (
                            <li key={resource.id} className="card flex items-center justify-between gap-4 p-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{resource.name}</span>
                                        <span className="badge badge-neutral">{resource.category}</span>
                                        {!resource.isActive && <span className="badge badge-danger">Inactive</span>}
                                    </div>
                                    <p className="text-sm text-(--muted)">
                                        {resource.location} · capacity {resource.capacity}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <Link
                                        href={`/admin/resources/${resource.id}/edit`}
                                        className="btn btn-secondary px-3 py-1.5 text-xs"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </Link>
                                    <form action={deleteResourceAction.bind(null, resource.id)}>
                                        <button
                                            type="submit"
                                            className="flex items-center gap-1.5 rounded-lg border border-(--danger)/30 px-3 py-1.5 text-xs font-medium text-(--danger) transition-colors hover:bg-(--danger-bg)"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
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
