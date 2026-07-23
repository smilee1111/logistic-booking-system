import Link from 'next/link';
import { CalendarDays, Download, MessageSquareText, Phone } from 'lucide-react';
import { cancelBookingFormAction, getMyBookingsAction } from '@/app/actions/bookings';

const statusBadgeClass: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-success',
    rejected: 'badge-danger',
    cancelled: 'badge-neutral',
    completed: 'badge-info',
};

export default async function MyBookingsPage() {
    const bookings = await getMyBookingsAction();

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-3xl space-y-6">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">My bookings</h1>
                        <p className="text-sm text-(--muted)">Everything you&apos;ve reserved, in one place.</p>
                    </div>
                    {bookings.length > 0 && (
                        <div className="flex gap-2 text-sm">
                            <a href="/api/bookings/export?format=csv" className="btn btn-secondary px-3 py-1.5 text-xs">
                                <Download className="h-3.5 w-3.5" />
                                CSV
                            </a>
                            <a href="/api/bookings/export?format=json" className="btn btn-secondary px-3 py-1.5 text-xs">
                                <Download className="h-3.5 w-3.5" />
                                JSON
                            </a>
                        </div>
                    )}
                </div>

                {bookings.length === 0 ? (
                    <div className="card p-8 text-center">
                        <p className="text-sm text-(--muted)">
                            No bookings yet. Browse{' '}
                            <Link href="/resources" className="link">
                                resources
                            </Link>{' '}
                            to book one.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {bookings.map((booking) => (
                            <li key={booking.id} className="card space-y-2.5 p-5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-1.5 text-sm font-medium">
                                        <CalendarDays className="h-4 w-4 text-(--muted)" />
                                        {new Date(booking.startTime).toLocaleString()} —{' '}
                                        {new Date(booking.endTime).toLocaleString()}
                                    </span>
                                    <span className={`badge ${statusBadgeClass[booking.status] ?? 'badge-neutral'} shrink-0`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <p className="flex items-center gap-1.5 text-sm text-(--muted)">
                                    <Phone className="h-3.5 w-3.5" />
                                    {booking.contactPhone}
                                </p>
                                {booking.specialRequests && (
                                    // FIXED (was the stored-XSS vulnerability named in PROJECT_GUIDE.md's
                                    // pentest plan — see VULN_LOG.md for the before/after). Plain JSX
                                    // interpolation lets React apply its default text escaping instead of
                                    // injecting raw HTML.
                                    <p className="flex items-start gap-1.5 text-sm text-(--muted)">
                                        <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        {booking.specialRequests}
                                    </p>
                                )}
                                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                    <form action={cancelBookingFormAction.bind(null, booking.id)} className="pt-1">
                                        <button type="submit" className="btn btn-secondary px-3 py-1.5 text-xs">
                                            Cancel
                                        </button>
                                    </form>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
