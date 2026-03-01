import { useUsage } from "../../hooks/useUsage";

export function UsageDashboard() {
  const { data: usage, isLoading } = useUsage();

  if (isLoading) return <div className="p-4 text-sm text-gray-500">Loading usage data...</div>;

  if (!usage) return <div className="p-4 text-sm text-gray-500">No usage data available</div>;

  const usersPercent = (usage.users / usage.limits.maxUsers) * 100;
  const orgsPercent = (usage.organizations / usage.limits.maxOrganizations) * 100;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Users</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{usage.users}</p>
          <p className="ml-2 text-sm text-gray-500">of {usage.limits.maxUsers}</p>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-blue-600" style={{ width: `${usersPercent}%` }}></div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500">Organizations</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{usage.organizations}</p>
          <p className="ml-2 text-sm text-gray-500">of {usage.limits.maxOrganizations}</p>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
          <div className="h-2 rounded-full bg-green-600" style={{ width: `${orgsPercent}%` }}></div>
        </div>
      </div>
    </div>
  );
}
