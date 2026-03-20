import { useState } from "react";
import { Plus, Trash2, Shield, ShieldOff } from "lucide-react";
import {
  useRestrictions,
  useCreateRestriction,
  useDeleteRestriction,
} from "../../hooks/useRestrictions";
import { useToast } from "../ui/Toast";
import { TableSkeleton } from "../ui/Skeleton";

export function SignupRestrictions() {
  const { data: restrictions, isLoading } = useRestrictions();
  const createRestriction = useCreateRestriction();
  const deleteRestriction = useDeleteRestriction();
  const { toast } = useToast();

  const [type, setType] = useState<"allowlist" | "blocklist">("allowlist");
  const [identifierType, setIdentifierType] = useState<"email" | "domain">("email");
  const [value, setValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    try {
      await createRestriction.mutateAsync({
        type,
        identifier_type: identifierType,
        value: value.trim(),
      });
      setValue("");
      toast("Restriction added", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRestriction.mutateAsync(id);
      toast("Restriction removed", "success");
    } catch {
      toast("Failed to remove restriction", "error");
    }
  };

  if (isLoading) return <TableSkeleton rows={3} columns={3} />;

  const allowlist = restrictions?.filter((r) => r.type === "allowlist") ?? [];
  const blocklist = restrictions?.filter((r) => r.type === "blocklist") ?? [];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            List type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "allowlist" | "blocklist")}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="allowlist">Allowlist</option>
            <option value="blocklist">Blocklist</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Identifier
          </label>
          <select
            value={identifierType}
            onChange={(e) => setIdentifierType(e.target.value as "email" | "domain")}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="email">Email</option>
            <option value="domain">Domain</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Value
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={identifierType === "email" ? "user@example.com" : "example.com"}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-100"
            required
          />
        </div>
        <button
          type="submit"
          disabled={createRestriction.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>

      {allowlist.length > 0 && (
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-300 mb-2">
            <Shield className="h-4 w-4" />
            Allowlist ({allowlist.length})
          </h4>
          <div className="space-y-1">
            {allowlist.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 dark:bg-green-900/30 px-3 py-2"
              >
                <div className="text-sm">
                  <span className="inline-flex rounded bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 text-xs text-green-700 dark:text-green-300 mr-2">
                    {r.identifierType}
                  </span>
                  {r.value}
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {blocklist.length > 0 && (
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-medium text-red-700 dark:text-red-400 mb-2">
            <ShieldOff className="h-4 w-4" />
            Blocklist ({blocklist.length})
          </h4>
          <div className="space-y-1">
            {blocklist.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2"
              >
                <div className="text-sm">
                  <span className="inline-flex rounded bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 text-xs text-red-700 dark:text-red-400 mr-2">
                    {r.identifierType}
                  </span>
                  {r.value}
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {allowlist.length === 0 && blocklist.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No signup restrictions configured. All email addresses can sign up.
        </p>
      )}
    </div>
  );
}
