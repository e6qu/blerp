import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8">
      <h1>Blerp Next.js Quickstart</h1>
      <p>This is a public page.</p>
      <Link href="/dashboard" className="text-blue-600 underline">
        Go to Dashboard (Protected)
      </Link>
    </div>
  );
}
