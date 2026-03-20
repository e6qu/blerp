import { ArrowLeft } from "lucide-react";
import { useWebhookDeliveries } from "../../hooks/useWebhooks";
import { TableSkeleton } from "../ui/Skeleton";

interface WebhookDeliveryLogProps {
  endpointId: string;
  onBack: () => void;
}

export function WebhookDeliveryLog({ endpointId, onBack }: WebhookDeliveryLogProps) {
  const { data: deliveries, isLoading } = useWebhookDeliveries(endpointId);

  if (isLoading) return <TableSkeleton rows={5} columns={4} />;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to webhooks
      </button>

      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Delivery Log</h3>

      {deliveries && deliveries.length > 0 ? (
        <div className="overflow-hidden rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  HTTP Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Attempt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Delivered At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">
                      {delivery.event_type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        delivery.status === "success"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : delivery.status === "failed"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {delivery.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {delivery.http_status ?? "\u2014"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    #{delivery.attempt_number}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {delivery.delivered_at
                      ? new Date(delivery.delivered_at).toLocaleString()
                      : "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
          <p>No deliveries recorded yet.</p>
        </div>
      )}
    </div>
  );
}
