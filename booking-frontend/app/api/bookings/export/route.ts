import type { NextRequest } from 'next/server';
import { authenticatedBackendFetch } from '@/lib/backend';

// A Route Handler, not a Server Action — file downloads need a real HTTP
// response with Content-Disposition, which a Server Action can't produce.
// The browser hits this same-origin URL directly (e.g. via a plain <a href>),
// so its Next.js-scoped cookies are sent automatically; this then proxies the
// authenticated call to the backend server-to-server.
export async function GET(request: NextRequest) {
    const format = request.nextUrl.searchParams.get('format') === 'json' ? 'json' : 'csv';
    const response = await authenticatedBackendFetch(`/api/bookings/export?format=${format}`);

    if (!response.ok) {
        return new Response(JSON.stringify({ message: 'Failed to export bookings' }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const body = await response.arrayBuffer();
    const headers = new Headers();
    const contentType = response.headers.get('content-type');
    const contentDisposition = response.headers.get('content-disposition');
    if (contentType) headers.set('Content-Type', contentType);
    if (contentDisposition) headers.set('Content-Disposition', contentDisposition);

    return new Response(body, { status: 200, headers });
}
