/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSessions, useRevokeSession } from "../../hooks/useSessions";
import { Monitor, Trash2 } from "lucide-react";

export function SessionsViewer() {
  const { data: sessions, isLoading } = useSessions();
  const revokeSession = useRevokeSession();

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading sessions...</div>;

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
          {sessions?.map((session: any) => (
            <tr key={session.id}>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <Monitor className="mr-3 h-5 w-5 text-gray-400" />
                  <div className="text-sm text-gray-900">
                    {session.userAgent || "Unknown Device"}
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {new Date(session.lastActiveAt).toLocaleString()}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
