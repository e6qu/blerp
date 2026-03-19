import { useState } from "react";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import { Pagination } from "../ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { TableSkeleton } from "../ui/Skeleton";
import type { components } from "@blerp/shared";

type AuditLogEntry = components["schemas"]["AuditLogEntry"];

const ACTION_OPTIONS = [
  "user.created",
  "user.updated",
  "user.deleted",
  "organization.created",
  "organization.updated",
  "organization.deleted",
  "session.created",
  "session.revoked",
];

export function AuditLogViewer() {
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<{
    action?: string;
    start_date?: string;
    end_date?: string;
  }>({});

  const pagination = usePagination(20);
  const { data, isLoading } = useAuditLogs({
    ...appliedFilters,
    limit: pagination.pageSize,
    offset: (pagination.page - 1) * pagination.pageSize,
  });

  const logs = data?.logs ?? [];
  const totalCount = data?.total ?? 0;
  const hasNextPage = pagination.page * pagination.pageSize < totalCount;

  const applyFilters = () => {
    setAppliedFilters({
      action: actionFilter || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });
  };

  const clearFilters = () => {
    setActionFilter("");
    setStartDate("");
    setEndDate("");
    setAppliedFilters({});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-1.5 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:ring-blue-400"
          >
            <option value="">All actions</option>
            {ACTION_OPTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-1.5 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:ring-blue-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-1.5 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:ring-blue-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:ring-blue-400"
          >
            Clear
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : (
        <div className="overflow-hidden rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Metadata
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log: AuditLogEntry) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-50">
                    {log.action}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {log.actor.email || log.actor.id} ({log.actor.type})
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {totalCount > pagination.pageSize && (
            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              hasNextPage={hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              onNextPage={() =>
                pagination.goToNextPage(String(pagination.page * pagination.pageSize))
              }
              onPreviousPage={pagination.goToPreviousPage}
              onPageSizeChange={pagination.setPageSize}
              itemCount={totalCount}
            />
          )}
        </div>
      )}
    </div>
  );
}
