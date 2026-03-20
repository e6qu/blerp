import { useState } from "react";
import { Search, Users } from "lucide-react";
import { useUsers, useBulkUpdateUsers } from "../../hooks/useUsers";
import { Pagination } from "../ui/Pagination";
import { usePagination } from "../../hooks/usePagination";
import { TableSkeleton } from "../ui/Skeleton";
import type { components } from "@blerp/shared";

type User = components["schemas"]["User"];

export function UsersListPage() {
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "banned" | "">("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const pagination = usePagination(20);
  const bulkUpdate = useBulkUpdateUsers();

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedUsers.map((u: User) => u.id)));
    }
  };

  const handleBulkAction = (action: "delete" | "ban" | "activate") => {
    if (selectedIds.size === 0) return;
    bulkUpdate.mutate(
      { user_ids: Array.from(selectedIds), action },
      { onSuccess: () => setSelectedIds(new Set()) },
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      inactive: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100",
      banned: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          <h1 className="text-3xl font-bold dark:text-gray-50">User Management</h1>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:text-gray-100"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {selectedIds.size} user{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => handleBulkAction("activate")}
              disabled={bulkUpdate.isPending}
              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction("ban")}
              disabled={bulkUpdate.isPending}
              className="rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              Ban
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              disabled={bulkUpdate.isPending}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      paginatedUsers.length > 0 && selectedIds.size === paginatedUsers.length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUsers.map((user: User) => {
                const initials = `${(user.first_name ?? "?")[0]}${(user.last_name ?? "")[0] ?? ""}`;
                return (
                  <tr
                    key={user.id}
                    className={selectedIds.has(user.id) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}
                  >
                    <td className="w-10 px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        {user.image_url ? (
                          <img src={user.image_url} alt="" className="h-8 w-8 rounded-full" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-xs font-medium text-blue-600 dark:text-blue-400">
                            {initials}
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                            {user.first_name ?? ""} {user.last_name ?? ""}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.email_addresses?.[0]?.email ?? "\u2014"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(user.status)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.username ?? "\u2014"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "\u2014"}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
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
