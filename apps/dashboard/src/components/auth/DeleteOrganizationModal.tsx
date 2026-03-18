import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { useDeleteOrganization } from "../../hooks/useDeleteOrganization";
import { useToast } from "../ui/Toast";

interface DeleteOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  organizationId: string;
  onSuccess: () => void;
}

export function DeleteOrganizationModal({
  isOpen,
  onClose,
  organizationName,
  organizationId,
  onSuccess,
}: DeleteOrganizationModalProps) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const deleteOrg = useDeleteOrganization();
  const { toast } = useToast();

  const handleClose = () => {
    setConfirmation("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (confirmation !== organizationName) {
      setError("Organization name does not match");
      return;
    }

    try {
      await deleteOrg.mutateAsync(organizationId);
      toast("Organization deleted successfully", "success");
      handleClose();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete organization");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Delete Organization</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-red-50 p-3">
          <p className="text-sm text-red-700">
            This action cannot be undone. This will permanently delete the organization, all
            memberships, invitations, and associated domains.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="org-delete-confirm" className="block text-sm font-medium text-gray-700">
              Type <span className="font-mono font-semibold">{organizationName}</span> to confirm
            </label>
            <input
              id="org-delete-confirm"
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
              placeholder={organizationName}
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleteOrg.isPending || confirmation !== organizationName}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteOrg.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {deleteOrg.isPending ? "Deleting..." : "Delete organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
