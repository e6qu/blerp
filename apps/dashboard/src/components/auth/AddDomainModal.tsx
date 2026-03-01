import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAddDomain } from "../../hooks/useDomains";

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export function AddDomainModal({ isOpen, onClose, organizationId }: AddDomainModalProps) {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const addDomain = useAddDomain();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedDomain = domain.toLowerCase().trim();

    try {
      await addDomain.mutateAsync({
        organizationId,
        domain: normalizedDomain,
      });
      setDomain("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain");
    }
  };

  const handleClose = () => {
    setDomain("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add domain</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
              Domain
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="example.com"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the domain you want to verify for your organization.
            </p>
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
              disabled={addDomain.isPending || !domain.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {addDomain.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {addDomain.isPending ? "Adding..." : "Add domain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
