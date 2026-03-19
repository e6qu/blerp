import { useState } from "react";
import { TableSkeleton } from "../ui/Skeleton";
import {
  useMemberships,
  useUpdateMembership,
  useDeleteMembership,
} from "../../hooks/useOrganizations";
import { useRoles } from "../../hooks/useRoles";
import { Pencil, Trash2, X, Check } from "lucide-react";
import type { components } from "@blerp/shared";

type Membership = components["schemas"]["Membership"];

const DEFAULT_ROLES = ["owner", "admin", "member"];

export function OrganizationMembers({ organizationId }: { organizationId: string }) {
  const { data: memberships, isLoading } = useMemberships(organizationId);
  const { data: roles } = useRoles(organizationId);
  const updateMembership = useUpdateMembership(organizationId);
  const deleteMembership = useDeleteMembership(organizationId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  if (isLoading) return <TableSkeleton rows={3} columns={4} />;

  const availableRoles = roles ? roles.map((r) => r.name) : DEFAULT_ROLES;

  const handleEditClick = (membership: Membership) => {
    setEditingId(membership.id);
    setSelectedRole(membership.role);
  };

  const handleSave = (membershipId: string) => {
    updateMembership.mutate(
      { membershipId, role: selectedRole },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const handleCancel = () => {
    setEditingId(null);
    setSelectedRole("");
  };

  const handleDelete = (membershipId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      deleteMembership.mutate(membershipId);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-white dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Role
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {memberships?.map((membership: Membership) => (
            <tr key={membership.id}>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      User ID: {membership.user_id}
                    </div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                {editingId === membership.id ? (
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      membership.role === "owner"
                        ? "bg-purple-100 text-purple-800"
                        : membership.role === "admin"
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800"
                          : DEFAULT_ROLES.includes(membership.role)
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                    }`}
                  >
                    {membership.role}
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                {editingId === membership.id ? (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleSave(membership.id)}
                      disabled={updateMembership.isPending}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(membership)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(membership.id)}
                      disabled={deleteMembership.isPending}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
