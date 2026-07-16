import Link from 'next/link';
import { cancelBookingFormAction, getMyBookingsAction } from '@/app/actions/bookings';

export default async function MyBookingsPage() {
    const bookings = await getMyBookingsAction();

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-3xl space-y-6">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">My bookings</h1>
                    {bookings.length > 0 && (
                        <div className="flex gap-2 text-sm">
                            <a
                                href="/api/bookings/export?format=csv"
                                className="rounded-md border border-black/10 px-3 py-1.5 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                            >
                                Export CSV
                            </a>
                            <a
                                href="/api/bookings/export?format=json"
                                className="rounded-md border border-black/10 px-3 py-1.5 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                            >
                                Export JSON
                            </a>
                        </div>
                    )}
                </div>

                {bookings.length === 0 ? (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        No bookings yet. Browse{' '}
                        <Link href="/resources" className="underline">
                            resources
                        </Link>{' '}
                        to book one.
                    </p>
                ) : (
                    <ul className="space-y-4">
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
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Contact: {booking.contactPhone}
                                </p>
                                {booking.specialRequests && (
                                    // FIXED (was the stored-XSS vulnerability named in PROJECT_GUIDE.md's
                                    // pentest plan — see VULN_LOG.md for the before/after). Plain JSX
                                    // interpolation lets React apply its default text escaping instead of
                                    // injecting raw HTML.
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {booking.specialRequests}
                                    </p>
                                )}
                                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                    <form action={cancelBookingFormAction.bind(null, booking.id)}>
                                        <button
                                            type="submit"
                                            className="rounded-md border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                                        >
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
