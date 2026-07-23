import { notFound } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { getResource } from '@/lib/resources';
import { ResourceForm } from '@/components/admin/ResourceForm';

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const resource = await getResource(id);

    if (!resource) {
        notFound();
    }

    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <div className="card w-full max-w-sm space-y-6 p-8">
                <div className="space-y-1.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10 text-(--primary)">
                        <Wrench className="h-5 w-5" />
                    </span>
                    <h1 className="pt-1 text-2xl font-semibold tracking-tight">Edit resource</h1>
                </div>
                <ResourceForm mode="edit" resourceId={resource.id} defaultValues={resource} />
            </div>
        </main>
    );
}
