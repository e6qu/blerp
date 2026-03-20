import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useToast } from "../ui/Toast";
import { client } from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
}

export function EditOrganizationModal({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  organizationSlug,
}: EditOrganizationModalProps) {
  const [name, setName] = useState(organizationName);
  const [slug, setSlug] = useState(organizationSlug);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setName(organizationName);
      setSlug(organizationSlug);
      setError(null);
    }
  }, [isOpen, organizationName, organizationSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }

    setIsPending(true);
    try {
      const { error: apiError } = await client.PATCH("/v1/organizations/{organization_id}", {
        params: { path: { organization_id: organizationId } },
        body: { name: name.trim(), slug: slug.trim() || undefined },
      });
      if (apiError)
        throw new Error(
          (apiError as { message?: string }).message || "Failed to update organization",
        );
      toast("Organization updated", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update organization");
    } finally {
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Edit organization</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-org-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Organization name
            </label>
            <input
              id="edit-org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-org-slug"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Organization slug
            </label>
            <input
              id="edit-org-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
