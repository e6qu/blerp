import { useState } from "react";
import { Search, Users } from "lucide-react";
import { useUsers } from "../../hooks/useUsers";
import { Pagination } from "../ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { TableSkeleton } from "../ui/Skeleton";
import type { components } from "@blerp/shared";

type User = components["schemas"]["User"];

export function UsersListPage() {
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "banned" | "">("");
  const [search, setSearch] = useState("");
  const pagination = usePagination(20);

  const { data: users, isLoading } = useUsers({
    status: statusFilter || undefined,
    limit: pagination.pageSize,
    cursor: pagination.cursor,
  });

  const filteredUsers = search
    ? (users ?? []).filter((user: User) => {
        const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.toLowerCase();
        const email = user.email_addresses?.[0]?.email?.toLowerCase() ?? "";
        return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
      })
    : (users ?? []);

  const start = (pagination.page - 1) * pagination.pageSize;
  const paginatedUsers = filteredUsers.slice(start, start + pagination.pageSize);
  const hasNextPage = start + pagination.pageSize < filteredUsers.length;

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      banned: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-gray-400" />
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.map((user: User) => {
                const initials = `${(user.first_name ?? "?")[0]}${(user.last_name ?? "")[0] ?? ""}`;
                return (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        {user.image_url ? (
                          <img src={user.image_url} alt="" className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                            {initials}
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name ?? ""} {user.last_name ?? ""}
                          </div>
                          <div className="text-xs text-gray-500">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.email_addresses?.[0]?.email ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(user.status)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.username ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredUsers.length > pagination.pageSize && (
            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              hasNextPage={hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              onNextPage={() => pagination.goToNextPage(String(start + pagination.pageSize))}
              onPreviousPage={pagination.goToPreviousPage}
              onPageSizeChange={pagination.setPageSize}
              itemCount={filteredUsers.length}
            />
          )}
        </div>
      )}
    </div>
  );
}
