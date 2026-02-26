/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemberships } from "../../hooks/useOrganizations";
import type { components } from "@blerp/shared";

type Membership = components["schemas"]["Membership"];

export function OrganizationMembers({ organizationId }: { organizationId: string }) {
  const { data: memberships, isLoading } = useMemberships(organizationId);

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading members...</div>;

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Role
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {memberships?.map((membership: Membership) => (
            <tr key={membership.id}>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200"></div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {(membership as any).user?.first_name} {(membership as any).user?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">User ID: {membership.user_id}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    membership.role === "owner"
                      ? "bg-purple-100 text-purple-800"
                      : membership.role === "admin"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {membership.role}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
