import { useState } from "react";
import { Plus, RefreshCw, Trash2, Copy, Check } from "lucide-react";
import { useApiKeys, useRotateApiKey, useRevokeApiKey } from "../../hooks/useProject";
import { CreateApiKeyModal } from "./CreateApiKeyModal";
import { TableSkeleton } from "../ui/Skeleton";
import type { components } from "@blerp/shared";

type APIKey = components["schemas"]["APIKey"];

export function ApiKeysList() {
  const { data: keys, isLoading } = useApiKeys();
  const rotateApiKey = useRotateApiKey();
  const revokeApiKey = useRevokeApiKey();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rotatingKeyId, setRotatingKeyId] = useState<string | null>(null);
  const [rotatedSecret, setRotatedSecret] = useState<{ keyId: string; secret: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const handleRotate = async (keyId: string) => {
    if (
      confirm(
        "Are you sure you want to rotate this key? The old key will stop working immediately.",
      )
    ) {
      setRotatingKeyId(keyId);
      try {
        const result = await rotateApiKey.mutateAsync(keyId);
        if (result?.secret) {
          setRotatedSecret({ keyId, secret: result.secret });
        }
      } finally {
        setRotatingKeyId(null);
      }
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (confirm("Are you sure you want to revoke this key? This cannot be undone.")) {
      await revokeApiKey.mutateAsync(keyId);
    }
  };

  const handleCopySecret = async () => {
    if (rotatedSecret?.secret) {
      await navigator.clipboard.writeText(rotatedSecret.secret);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setRotatedSecret(null);
      }, 2000);
    }
  };

  if (isLoading) return <TableSkeleton rows={3} columns={5} />;

  const activeKeys = keys?.filter((k) => k.status === "active") || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create key
        </button>
      </div>

      {rotatedSecret && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h4 className="text-sm font-medium text-yellow-800">Key rotated successfully</h4>
          <p className="mt-1 text-xs text-yellow-700">
            Copy your new key now — it won&apos;t be shown again.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 rounded bg-yellow-100 px-2 py-1.5 text-xs font-mono text-yellow-900 break-all">
              {rotatedSecret.secret}
            </code>
            <button
              onClick={handleCopySecret}
              className="rounded p-1.5 hover:bg-yellow-200"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-yellow-700" />
              )}
            </button>
          </div>
        </div>
      )}

      {activeKeys.length > 0 ? (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Environment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeKeys.map((key: APIKey) => (
                <tr key={key.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono text-gray-900">{key.prefix}</div>
                    {key.label && <div className="text-xs text-gray-500">{key.label}</div>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        key.type === "secret"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {key.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {key.environment}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {key.created_at ? new Date(key.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRotate(key.id)}
                        disabled={rotatingKeyId === key.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        title="Rotate key"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${rotatingKeyId === key.id ? "animate-spin" : ""}`}
                        />
                      </button>
                      <button
                        onClick={() => handleRevoke(key.id)}
                        disabled={revokeApiKey.isPending}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Revoke key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
          <p>No API keys yet.</p>
          <p className="text-sm">Create a key to authenticate API requests.</p>
        </div>
      )}

      <CreateApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
