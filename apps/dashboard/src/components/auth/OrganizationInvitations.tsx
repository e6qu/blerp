import { useInvitations } from "../../hooks/useOrganizations";
import type { components } from "@blerp/shared";

type Invitation = components["schemas"]["Invitation"];

export function OrganizationInvitations({ organizationId }: { organizationId: string }) {
  const { data: invitations, isLoading } = useInvitations(organizationId);

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading invitations...</div>;

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {invitations?.map((invitation: Invitation) => (
            <tr key={invitation.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {invitation.email}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {invitation.role}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    invitation.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : invitation.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {invitation.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                {invitation.status === "pending" && (
                  <button className="text-red-600 hover:text-red-900">Revoke</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
