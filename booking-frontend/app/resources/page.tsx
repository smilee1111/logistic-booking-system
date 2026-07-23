import Link from 'next/link';
import { FlaskConical, MapPin, MonitorSmartphone, Users2, type LucideIcon } from 'lucide-react';
import { getResources } from '@/lib/resources';

const categoryIcons: Record<string, LucideIcon> = {
    lab: FlaskConical,
    equipment: MonitorSmartphone,
    room: Users2,
};

export default async function ResourcesPage() {
    const resources = await getResources();
    const activeResources = resources.filter((resource) => resource.isActive);

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Resources</h1>
                    <p className="text-sm text-(--muted)">Browse available labs, equipment, and rooms.</p>
                </div>

                {activeResources.length === 0 ? (
                    <p className="text-sm text-(--muted)">No resources available yet.</p>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {activeResources.map((resource) => {
                            const Icon = categoryIcons[resource.category] ?? FlaskConical;
                            return (
                                <li key={resource.id} className="card space-y-3 p-5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
                                                <Icon className="h-4.5 w-4.5" />
                                            </span>
                                            <h2 className="font-medium">{resource.name}</h2>
                                        </div>
                                        <span className="badge badge-neutral shrink-0">{resource.category}</span>
                                    </div>
                                    <p className="text-sm text-(--muted)">{resource.description}</p>
                                    <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--muted)">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <dd>{resource.location}</dd>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users2 className="h-3 w-3" />
                                            <dd>Capacity {resource.capacity}</dd>
                                        </div>
                                    </dl>
                                    {resource.requiresApproval && <span className="badge badge-warning">Requires approval</span>}
                                    <div className="pt-1">
                                        <Link
                                            href={`/bookings/new?resourceId=${resource.id}`}
                                            className="btn btn-primary px-4 py-1.5 text-xs"
                                        >
                                            Book
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </main>
    );
}
