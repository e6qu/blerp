import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { useDeleteAccount } from "../../hooks/useDeleteAccount";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const deleteAccount = useDeleteAccount();

  const CONFIRM_TEXT = "DELETE MY ACCOUNT";

  const handleClose = () => {
    setConfirmation("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (confirmation !== CONFIRM_TEXT) {
      setError("Confirmation text does not match");
      return;
    }

    try {
      await deleteAccount.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Delete Account</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-700 dark:text-red-400">
            This action cannot be undone. Your account and all associated data will be permanently
            deleted. You will be signed out immediately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="account-delete-confirm"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Type <span className="font-mono font-semibold">{CONFIRM_TEXT}</span> to confirm
            </label>
            <input
              id="account-delete-confirm"
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm dark:bg-gray-800 dark:text-gray-100"
              placeholder={CONFIRM_TEXT}
              required
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
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
              type="submit"
              disabled={deleteAccount.isPending || confirmation !== CONFIRM_TEXT}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteAccount.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {deleteAccount.isPending ? "Deleting..." : "Delete account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
