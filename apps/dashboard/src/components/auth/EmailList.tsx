import { useState } from "react";
import { Plus, Star, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useEmails, useDeleteEmail, useSetPrimaryEmail } from "../../hooks/useEmails";
import { useCurrentUser } from "../../hooks/useUser";
import { AddEmailModal } from "./AddEmailModal";
import type { components } from "@blerp/shared";

type EmailAddress = components["schemas"]["EmailAddress"];

export function EmailList() {
  const { data: emails, isLoading } = useEmails();
  const { data: user } = useCurrentUser();
  const deleteEmail = useDeleteEmail();
  const setPrimaryEmail = useSetPrimaryEmail();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (emailId: string) => {
    if (user?.primary_email_id === emailId) {
      alert("Cannot delete primary email address");
      return;
    }
    if (confirm("Are you sure you want to delete this email address?")) {
      deleteEmail.mutate(emailId);
    }
  };

  const handleSetPrimary = (emailId: string) => {
    if (confirm("Set this as your primary email address?")) {
      setPrimaryEmail.mutate(emailId);
    }
  };

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading emails...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add email
        </button>
      </div>

      {emails && emails.length > 0 ? (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
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
              {emails.map((email: EmailAddress) => {
                const isPrimary = user?.primary_email_id === email.id;
                return (
                  <tr key={email.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{email.email}</span>
                        {isPrimary && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            <Star className="h-3 w-3" />
                            Primary
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 text-xs font-semibold leading-5 ${
                          email.verification.status === "verified"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {email.verification.status === "verified" ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Unverified
                          </>
                        )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {!isPrimary && email.verification.status === "verified" && (
                          <button
                            onClick={() => handleSetPrimary(email.id)}
                            disabled={setPrimaryEmail.isPending}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Set as primary"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        {!isPrimary && (
                          <button
                            onClick={() => handleDelete(email.id)}
                            disabled={deleteEmail.isPending}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
          <p>No email addresses yet.</p>
          <p className="text-sm">Add an email address to get started.</p>
        </div>
      )}

      <AddEmailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
