import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAddEmail } from "../../hooks/useEmails";

interface AddEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddEmailModal({ isOpen, onClose }: AddEmailModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const addEmail = useAddEmail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await addEmail.mutateAsync(email);
      setEmail("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add email");
    }
  };

  const handleClose = () => {
    setEmail("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Add email address</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-gray-100"
              placeholder="you@example.com"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              A verification email will be sent to this address.
            </p>
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
              disabled={addEmail.isPending || !email}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {addEmail.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {addEmail.isPending ? "Adding..." : "Add email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
