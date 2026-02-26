/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuditLogs } from "../../hooks/useAuditLogs";

export function AuditLogViewer() {
  const { data: logs, isLoading } = useAuditLogs();

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading audit logs...</div>;

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Payload
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {logs?.map((log: any) => (
            <tr key={log.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {log.action}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {log.userId || "system"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">
                {JSON.stringify(log.payload)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
