import { notFound } from 'next/navigation';
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
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">Edit resource</h1>
                <ResourceForm mode="edit" resourceId={resource.id} defaultValues={resource} />
            </div>
        </main>
    );
}
