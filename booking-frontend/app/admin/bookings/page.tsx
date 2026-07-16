import { decideBookingAction, getAllBookingsAction } from '@/app/actions/admin/bookings';

export default async function AdminBookingsPage() {
    const bookings = await getAllBookingsAction();

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-4xl space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">All bookings</h1>

                {bookings.length === 0 ? (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">No bookings yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {bookings.map((booking) => (
                            <li
                                key={booking.id}
                                className="space-y-2 rounded-md border border-black/10 p-4 dark:border-white/15"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium">
                                        {new Date(booking.startTime).toLocaleString()} —{' '}
                                        {new Date(booking.endTime).toLocaleString()}
                                    </span>
                                    <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-xs capitalize dark:bg-white/10">
                                        {booking.status}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500">
                                    Resource: {booking.resourceId} · User: {booking.userId}
                                </p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Contact: {booking.contactPhone}
                                </p>
                                {booking.specialRequests && (
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Notes: {booking.specialRequests}
                                    </p>
                                )}
                                {booking.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <form action={decideBookingAction.bind(null, booking.id, 'confirmed')}>
                                            <button
                                                type="submit"
                                                className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
                                            >
                                                Approve
                                            </button>
                                        </form>
                                        <form action={decideBookingAction.bind(null, booking.id, 'rejected')}>
                                            <button
                                                type="submit"
                                                className="rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                                            >
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
