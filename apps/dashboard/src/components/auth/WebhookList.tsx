import { useState } from "react";
import { Trash2, ShieldAlert, Plus, FileText } from "lucide-react";
import { useWebhooks, useDeleteWebhook } from "../../hooks/useWebhooks";
import { CreateWebhookModal } from "./CreateWebhookModal";
import { WebhookDeliveryLog } from "./WebhookDeliveryLog";
import { TableSkeleton } from "../ui/Skeleton";
import type { components } from "@blerp/shared";

type WebhookEndpoint = components["schemas"]["WebhookEndpoint"];

export function WebhookList() {
  const { data: webhooks, isLoading } = useWebhooks();
  const deleteWebhook = useDeleteWebhook();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deliveryEndpointId, setDeliveryEndpointId] = useState<string | null>(null);

  const handleDelete = (webhookId: string) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      deleteWebhook.mutate(webhookId);
    }
  };

  if (isLoading) return <TableSkeleton rows={3} columns={3} />;

  if (deliveryEndpointId) {
    return (
      <WebhookDeliveryLog
        endpointId={deliveryEndpointId}
        onBack={() => setDeliveryEndpointId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add webhook
        </button>
      </div>

      {webhooks && webhooks.length > 0 ? (
        <div className="overflow-hidden rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {webhooks.map((webhook: WebhookEndpoint) => (
                <tr key={webhook.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {webhook.url}
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <ShieldAlert className="mr-1 h-3 w-3" />
                      Secret: {webhook.secret?.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((evt) => (
                        <span
                          key={evt}
                          className="inline-flex rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300"
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
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {webhook.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDeliveryEndpointId(webhook.id)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="View deliveries"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(webhook.id)}
                        disabled={deleteWebhook.isPending}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 disabled:opacity-50"
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
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
          <p>No webhooks configured yet.</p>
          <p className="text-sm">Create a webhook to receive event notifications.</p>
        </div>
      )}

      <CreateWebhookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
