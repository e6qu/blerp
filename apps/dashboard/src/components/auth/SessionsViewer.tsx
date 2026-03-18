import { useSessions, useRevokeSession } from "../../hooks/useSessions";
import { Monitor, Smartphone, Tablet, Trash2 } from "lucide-react";
import { Pagination } from "../ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { TableSkeleton } from "../ui/Skeleton";
import { parseUserAgent } from "../../lib/userAgent";
import type { components } from "@blerp/shared";

type Session = components["schemas"]["Session"];

export function SessionsViewer() {
  const { data: sessions, isLoading } = useSessions();
  const revokeSession = useRevokeSession();
  const pagination = usePagination(10);

  if (isLoading) return <TableSkeleton rows={3} columns={3} />;

  const allSessions = sessions ?? [];
  const start = (pagination.page - 1) * pagination.pageSize;
  const paginatedSessions = allSessions.slice(start, start + pagination.pageSize);
  const hasNextPage = start + pagination.pageSize < allSessions.length;

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Device
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Last Active
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedSessions.map((session: Session) => {
            const ua = parseUserAgent(session.user_agent);
            const DeviceIcon =
              ua.device === "Mobile" ? Smartphone : ua.device === "Tablet" ? Tablet : Monitor;
            return (
              <tr key={session.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <DeviceIcon className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ua.browser} on {ua.os}
                      </div>
                      <div className="text-xs text-gray-500">{ua.device}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {session.latest_activity
                    ? new Date(session.latest_activity).toLocaleString()
                    : "Unknown"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => revokeSession.mutate(session.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {allSessions.length > pagination.pageSize && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          hasNextPage={hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          onNextPage={() => pagination.goToNextPage(String(start + pagination.pageSize))}
          onPreviousPage={pagination.goToPreviousPage}
          onPageSizeChange={pagination.setPageSize}
          itemCount={allSessions.length}
        />
      )}
    </div>
  );
}
