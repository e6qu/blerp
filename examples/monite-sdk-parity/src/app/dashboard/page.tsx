import { auth, currentUser } from "@blerp/nextjs/server";
import { Protect } from "@blerp/nextjs";

export default async function DashboardPage() {
  const { userId, orgRole } = await auth();
  const user = await currentUser();

  return (
    <div className="p-8">
      <h1>Dashboard</h1>
      <p>User ID: {userId}</p>
      <p>Role: {orgRole}</p>

      <Protect
        permission="org:write"
        fallback={
          <p className="text-red-600">You do not have permission to edit this organization.</p>
        }
      >
        <div className="mt-4 p-4 border rounded bg-green-50">
          <h2 className="font-bold">Admin Actions</h2>
          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
            Delete Organization
          </button>
        </div>
      </Protect>

      {user && <pre className="mt-8 p-4 bg-gray-100 rounded">{JSON.stringify(user, null, 2)}</pre>}
    </div>
  );
}
