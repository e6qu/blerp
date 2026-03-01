import { useState } from "react";
import { X, Loader2, Check, Copy } from "lucide-react";
import { useCreateWebhook } from "../../hooks/useWebhooks";

const AVAILABLE_EVENTS = [
  { id: "user.created", label: "User created" },
  { id: "user.updated", label: "User updated" },
  { id: "user.deleted", label: "User deleted" },
  { id: "organization.created", label: "Organization created" },
  { id: "organization.updated", label: "Organization updated" },
  { id: "organization.deleted", label: "Organization deleted" },
  { id: "session.created", label: "Session created" },
  { id: "session.revoked", label: "Session revoked" },
] as const;

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWebhookModal({ isOpen, onClose }: CreateWebhookModalProps) {
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const createWebhook = useCreateWebhook();

  const toggleEvent = (eventId: string) => {
    const newEvents = new Set(selectedEvents);
    if (newEvents.has(eventId)) {
      newEvents.delete(eventId);
    } else {
      newEvents.add(eventId);
    }
    setSelectedEvents(newEvents);
  };

  const selectAll = () => {
    setSelectedEvents(new Set(AVAILABLE_EVENTS.map((e) => e.id)));
  };

  const deselectAll = () => {
    setSelectedEvents(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedEvents.size === 0) {
      setError("Please select at least one event type");
      return;
    }

    try {
      const result = await createWebhook.mutateAsync({
        url,
        events: Array.from(selectedEvents),
      });
      if (result?.secret) {
        setCreatedSecret(result.secret);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create webhook");
    }
  };

  const handleCopySecret = async () => {
    if (createdSecret) {
      await navigator.clipboard.writeText(createdSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setUrl("");
    setSelectedEvents(new Set());
    setError(null);
    setCreatedSecret(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  if (createdSecret) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
        <div className="relative z-10 w-full max-w-md rounded-xl border bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Webhook created</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your webhook endpoint has been created. Save this signing secret now — it won&apos;t
              be shown again.
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <label className="mb-1 block text-xs font-medium text-gray-500">Signing Secret</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-gray-100 px-2 py-1.5 text-sm font-mono text-gray-800 break-all">
                  {createdSecret}
                </code>
                <button
                  onClick={handleCopySecret}
                  className="rounded p-2 hover:bg-gray-200"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>
      <div className="relative z-10 w-full max-w-lg rounded-xl border bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add webhook</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Endpoint URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="https://example.com/webhooks"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Webhook payloads will be sent to this URL via POST requests.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Events</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Select all
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Deselect all
                </button>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {AVAILABLE_EVENTS.map((event) => (
                <label
                  key={event.id}
                  className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.has(event.id)}
                    onChange={() => toggleEvent(event.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{event.label}</span>
                </label>
              ))}
            </div>
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
              disabled={createWebhook.isPending || !url || selectedEvents.size === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createWebhook.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {createWebhook.isPending ? "Creating..." : "Create webhook"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
