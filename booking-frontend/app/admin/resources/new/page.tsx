import { ResourceForm } from '@/components/admin/ResourceForm';

export default function NewResourcePage() {
    return (
        <main className="flex flex-1 items-center justify-center px-6 py-16">
            <div className="w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">New resource</h1>
                <ResourceForm mode="create" />
            </div>
        </main>
    );
}
