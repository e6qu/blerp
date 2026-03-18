import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useInvitations, useRevokeInvitation } from "../../hooks/useOrganizations";
import { InviteMemberModal } from "./InviteMemberModal";
import { TableSkeleton } from "../ui/Skeleton";
import type { components } from "@blerp/shared";

type Invitation = components["schemas"]["Invitation"];

export function OrganizationInvitations({ organizationId }: { organizationId: string }) {
  const { data: invitations, isLoading } = useInvitations(organizationId);
  const revokeInvitation = useRevokeInvitation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRevoke = (invitationId: string) => {
    if (confirm("Are you sure you want to revoke this invitation?")) {
      revokeInvitation.mutate(invitationId);
    }
  };

  if (isLoading) return <TableSkeleton rows={3} columns={4} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Invite member
        </button>
      </div>

      {invitations && invitations.length > 0 ? (
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
              {invitations.map((invitation: Invitation) => (
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
                      <button
                        onClick={() => handleRevoke(invitation.id)}
                        disabled={revokeInvitation.isPending}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
          <p>No invitations yet.</p>
          <p className="text-sm">Invite members to collaborate on this organization.</p>
        </div>
      )}

      <InviteMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organizationId={organizationId}
      />
    </div>
  );
}
