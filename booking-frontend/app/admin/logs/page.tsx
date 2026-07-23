import { getActivityLogsAction } from '@/app/actions/admin/logs';

function actionBadgeClass(action: string): string {
    if (action.includes('failed') || action === 'password_reset_requested') return 'badge-warning';
    if (action.includes('rejected') || action.includes('deleted')) return 'badge-danger';
    if (action.includes('created') || action.includes('approved') || action === 'login') return 'badge-success';
    return 'badge-neutral';
}

export default async function AdminLogsPage() {
    const logs = await getActivityLogsAction();

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Activity logs</h1>
                    <p className="text-sm text-(--muted)">Most recent 100 entries.</p>
                </div>

                {logs.length === 0 ? (
                    <p className="text-sm text-(--muted)">No activity yet.</p>
                ) : (
                    <div className="card overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-(--border) text-xs uppercase text-(--muted)">
                                <tr>
                                    <th className="px-4 py-3">Time</th>
                                    <th className="px-4 py-3">Action</th>
                                    <th className="px-4 py-3">Target</th>
                                    <th className="px-4 py-3">IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-b border-(--border) transition-colors last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                                    >
                                        <td className="px-4 py-2.5 whitespace-nowrap text-(--muted)">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className={`badge ${actionBadgeClass(log.action)}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-(--muted)">
                                            {log.targetType}
                                            {log.targetId ? ` · ${log.targetId}` : ''}
                                        </td>
                                        <td className="px-4 py-2.5 text-(--muted)">{log.ipAddress}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
