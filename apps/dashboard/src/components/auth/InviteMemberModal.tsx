import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateInvitation } from "../../hooks/useOrganizations";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export function InviteMemberModal({ isOpen, onClose, organizationId }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("member");
  const [error, setError] = useState<string | null>(null);
  const createInvitation = useCreateInvitation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await createInvitation.mutateAsync({
        email,
        organization_id: organizationId,
        role,
      });
      setEmail("");
      setRole("member");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("member");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Invite member</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="colleague@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {role === "owner" && "Full access including billing and deletion"}
              {role === "admin" && "Can manage members and settings"}
              {role === "member" && "Basic access to organization resources"}
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
              disabled={createInvitation.isPending || !email}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createInvitation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {createInvitation.isPending ? "Sending..." : "Send invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
