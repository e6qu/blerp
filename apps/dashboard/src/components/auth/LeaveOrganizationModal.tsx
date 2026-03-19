import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "../ui/Toast";
import { getCsrfToken, DEMO_USER_ID } from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface LeaveOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  organizationId: string;
  onSuccess: () => void;
}

export function LeaveOrganizationModal({
  isOpen,
  onClose,
  organizationName,
  organizationId,
  onSuccess,
}: LeaveOrganizationModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleLeave = async () => {
    setError(null);
    setIsPending(true);
    try {
      const token = await getCsrfToken();
      const headers: Record<string, string> = {
        "X-Tenant-Id": "demo-tenant",
        "X-User-Id": DEMO_USER_ID,
        "Content-Type": "application/json",
      };
      if (token) {
        headers["x-csrf-token"] = token;
      }
      const response = await fetch(`/v1/organizations/${organizationId}/leave`, {
        method: "POST",
        headers,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to leave organization");
      }
      toast("Left organization successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      handleClose();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave organization");
    } finally {
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
              Leave Organization
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 p-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Are you sure you want to leave <span className="font-semibold">{organizationName}</span>
            ? You will lose access to all organization resources. You will need a new invitation to
            rejoin.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLeave}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Leaving..." : "Leave organization"}
          </button>
        </div>
      </div>
    </div>
  );
}
