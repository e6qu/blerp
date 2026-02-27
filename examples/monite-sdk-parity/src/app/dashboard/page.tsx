import { auth, currentUser } from "@blerp/nextjs/server";
import { Protect } from "@blerp/nextjs";
import { getCurrentUserEntity } from "@/lib/blerp-api/get-current-user-entity";
import { MoniteApp } from "@/components/MoniteApp";

export default async function DashboardPage() {
  const { userId, orgRole } = await auth();
  const user = await currentUser();
  const moniteContext = await getCurrentUserEntity();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Monite Integration Dashboard</h1>
        <p className="text-gray-500">
          User ID: {userId} | Role: {orgRole}
        </p>
      </div>

      {moniteContext?.entityId ? (
        <MoniteApp entityId={moniteContext.entityId} />
      ) : (
        <div className="p-6 border-2 border-dashed rounded-lg bg-yellow-50 text-yellow-800">
          <h2 className="font-bold">Monite Context Missing</h2>
          <p>
            Please ensure your organization has an `entity_id` in its private metadata and your user
            is mapped correctly.
          </p>
        </div>
      )}

      <Protect
        permission="org:write"
        fallback={
          <p className="text-red-600">You do not have permission to edit this organization.</p>
        }
      >
        <div className="p-4 border rounded bg-green-50">
          <h2 className="font-bold">Admin Actions</h2>
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
            Delete Organization
          </button>
        </div>
      </Protect>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Raw Blerp User Object</h2>
        {user && (
          <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto max-h-64">
            {JSON.stringify(user, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
