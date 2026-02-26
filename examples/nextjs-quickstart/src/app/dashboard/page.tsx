import { auth, currentUser } from "@blerp/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  return (
    <div className="p-8">
      <h1>Dashboard</h1>
      <p>User ID: {userId}</p>
      {user && <pre>{JSON.stringify(user, null, 2)}</pre>}
    </div>
  );
}
