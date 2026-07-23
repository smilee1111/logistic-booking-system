import { Check, X } from 'lucide-react';
import { decideBookingAction, getAllBookingsAction } from '@/app/actions/admin/bookings';

const statusBadgeClass: Record<string, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-success',
    rejected: 'badge-danger',
    cancelled: 'badge-neutral',
    completed: 'badge-info',
};

export default async function AdminBookingsPage() {
    const bookings = await getAllBookingsAction();

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">All bookings</h1>
                    <p className="text-sm text-(--muted)">Review and decide on pending requests.</p>
                </div>

                {bookings.length === 0 ? (
                    <p className="text-sm text-(--muted)">No bookings yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {bookings.map((booking) => (
                            <li key={booking.id} className="card space-y-2 p-5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium">
                                        {new Date(booking.startTime).toLocaleString()} —{' '}
                                        {new Date(booking.endTime).toLocaleString()}
                                    </span>
                                    <span className={`badge ${statusBadgeClass[booking.status] ?? 'badge-neutral'} shrink-0`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <p className="text-xs text-(--muted)">
                                    Resource: {booking.resourceId} · User: {booking.userId}
                                </p>
                                <p className="text-sm text-(--muted)">Contact: {booking.contactPhone}</p>
                                {booking.specialRequests && (
                                    <p className="text-sm text-(--muted)">Notes: {booking.specialRequests}</p>
                                )}
                                {booking.status === 'pending' && (
                                    <div className="flex gap-2 pt-1">
                                        <form action={decideBookingAction.bind(null, booking.id, 'confirmed')}>
                                            <button
                                                type="submit"
                                                className="flex items-center gap-1.5 rounded-lg bg-(--success) px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                                Approve
                                            </button>
                                        </form>
                                        <form action={decideBookingAction.bind(null, booking.id, 'rejected')}>
                                            <button
                                                type="submit"
                                                className="flex items-center gap-1.5 rounded-lg border border-(--danger)/30 px-3 py-1.5 text-xs font-medium text-(--danger) transition-colors hover:bg-(--danger-bg)"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                                Reject
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
