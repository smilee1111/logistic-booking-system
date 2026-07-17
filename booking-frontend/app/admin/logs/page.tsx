import { getActivityLogsAction } from '@/app/actions/admin/logs';

export default async function AdminLogsPage() {
    const logs = await getActivityLogsAction();

    return (
        <main className="flex flex-1 flex-col items-center px-6 py-16">
            <div className="w-full max-w-4xl space-y-6">
                <h1 className="text-2xl font-semibold tracking-tight">Activity logs</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Most recent 100 entries.</p>

                {logs.length === 0 ? (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">No activity yet.</p>
                ) : (
                    <div className="overflow-x-auto rounded-md border border-black/10 dark:border-white/15">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-black/10 text-xs uppercase text-zinc-500 dark:border-white/15">
                                <tr>
                                    <th className="px-3 py-2">Time</th>
                                    <th className="px-3 py-2">Action</th>
                                    <th className="px-3 py-2">Target</th>
                                    <th className="px-3 py-2">IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2">{log.action}</td>
                                        <td className="px-3 py-2">
                                            {log.targetType}
                                            {log.targetId ? ` · ${log.targetId}` : ''}
                                        </td>
                                        <td className="px-3 py-2">{log.ipAddress}</td>
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
