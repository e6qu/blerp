import { useUsage } from "../../hooks/useUsage";

interface UsageData {
  users: number;
  organizations: number;
  limits: {
    maxUsers: number;
    maxOrganizations: number;
  };
}

export function UsageDashboard() {
  const { data, isLoading } = useUsage();
  const usage = data as unknown as UsageData;

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading usage data...</div>;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Users</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{usage?.users}</p>
          <p className="ml-2 text-sm text-gray-500">of {usage?.limits?.maxUsers}</p>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-blue-600"
            style={{ width: `${(usage?.users / usage?.limits?.maxUsers) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Organizations</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{usage?.organizations}</p>
          <p className="ml-2 text-sm text-gray-500">of {usage?.limits?.maxOrganizations}</p>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-green-600"
            style={{
              width: `${(usage?.organizations / usage?.limits?.maxOrganizations) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
