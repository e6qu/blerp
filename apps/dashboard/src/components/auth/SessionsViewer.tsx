import { useState } from "react";
import { useSessions, useRevokeSession, useRevokeAllSessions } from "../../hooks/useSessions";
import { Monitor, Smartphone, Tablet, Trash2, LogOut } from "lucide-react";
import { useToast } from "../ui/Toast";
import { Pagination } from "../ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { TableSkeleton } from "../ui/Skeleton";
import { parseUserAgent } from "../../lib/userAgent";
import type { components } from "@blerp/shared";

type Session = components["schemas"]["Session"];

export function SessionsViewer() {
  const { data: sessions, isLoading } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeAllSessions = useRevokeAllSessions();
  const pagination = usePagination(10);
  const { toast } = useToast();
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  const handleRevokeAll = async () => {
    try {
      const result = await revokeAllSessions.mutateAsync();
      toast(
        `Signed out of ${(result as { revoked_count: number }).revoked_count} other session(s)`,
        "success",
      );
      setConfirmRevokeAll(false);
    } catch {
      toast("Failed to revoke sessions", "error");
    }
  };

  if (isLoading) return <TableSkeleton rows={3} columns={4} />;

  const allSessions = sessions ?? [];
  const start = (pagination.page - 1) * pagination.pageSize;
  const paginatedSessions = allSessions.slice(start, start + pagination.pageSize);
  const hasNextPage = start + pagination.pageSize < allSessions.length;

  return (
    <div className="space-y-3">
      {allSessions.length > 1 && (
        <div className="flex items-center justify-end">
          {confirmRevokeAll ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Sign out all other sessions?
              </span>
              <button
                onClick={handleRevokeAll}
                disabled={revokeAllSessions.isPending}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {revokeAllSessions.isPending ? "Revoking..." : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmRevokeAll(false)}
                className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRevokeAll(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out all other sessions
            </button>
          )}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Last Active
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedSessions.map((session: Session) => {
              const ua = parseUserAgent(session.user_agent);
              const DeviceIcon =
                ua.device === "Mobile" ? Smartphone : ua.device === "Tablet" ? Tablet : Monitor;
              return (
                <tr key={session.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <DeviceIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          {ua.browser} on {ua.os}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{ua.device}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {session.ip_address || "\u2014"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {session.latest_activity
                      ? new Date(session.latest_activity).toLocaleString()
                      : "Unknown"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => revokeSession.mutate(session.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
    </div>
  );
}
