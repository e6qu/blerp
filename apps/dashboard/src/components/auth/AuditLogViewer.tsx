import { useAuditLogs } from "../../hooks/useAuditLogs";
import { Pagination } from "../ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { TableSkeleton } from "../ui/Skeleton";
import type { components } from "@blerp/shared";

type AuditLogEntry = components["schemas"]["AuditLogEntry"];

export function AuditLogViewer() {
  const { data: logs, isLoading } = useAuditLogs();
  const pagination = usePagination(20);

  if (isLoading) return <TableSkeleton rows={5} columns={4} />;

  const allLogs = logs ?? [];
  const start = (pagination.page - 1) * pagination.pageSize;
  const paginatedLogs = allLogs.slice(start, start + pagination.pageSize);
  const hasNextPage = start + pagination.pageSize < allLogs.length;

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
              Actor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Metadata
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedLogs.map((log: AuditLogEntry) => (
            <tr key={log.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {new Date(log.created_at).toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {log.action}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {log.actor.email || log.actor.id} ({log.actor.type})
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">
                {JSON.stringify(log.metadata)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {allLogs.length > pagination.pageSize && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          hasNextPage={hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          onNextPage={() => pagination.goToNextPage(String(start + pagination.pageSize))}
          onPreviousPage={pagination.goToPreviousPage}
          onPageSizeChange={pagination.setPageSize}
          itemCount={allLogs.length}
        />
      )}
    </div>
  );
}
