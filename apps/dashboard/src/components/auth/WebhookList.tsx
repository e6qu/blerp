import { useWebhooks, useDeleteWebhook } from "../../hooks/useWebhooks";
import { Trash2, ShieldAlert } from "lucide-react";
import type { components } from "@blerp/shared";

type WebhookEndpoint = components["schemas"]["WebhookEndpoint"];

export function WebhookList() {
  const { data: webhooks, isLoading } = useWebhooks();
  const deleteWebhook = useDeleteWebhook();

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading webhooks...</div>;

  return (
    <div className="space-y-4">
      {webhooks?.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
          <p>No webhooks configured yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {webhooks?.map((webhook: WebhookEndpoint) => (
                <tr key={webhook.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{webhook.url}</div>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <ShieldAlert className="mr-1 h-3 w-3" />
                      Secret: {webhook.secret?.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((evt) => (
                        <span
                          key={evt}
                          className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {evt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        webhook.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {webhook.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => deleteWebhook.mutate(webhook.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
