const API_URL = process.env.BLERP_API_URL || "http://localhost:3000";

async function globalSetup() {
  // Trigger tenant DB initialization (and auto-seed in dev mode)
  // by making a request with the demo-tenant header.
  try {
    const res = await fetch(`${API_URL}/v1/users/demo_user`, {
      headers: { "X-Tenant-Id": "demo-tenant", "X-User-Id": "demo_user" },
    });
    if (!res.ok) {
      console.warn(`Seed trigger returned ${res.status} — auto-seed may not have run.`);
    }
  } catch (error) {
    console.warn("API server not available at", API_URL);
    console.warn("Make sure `bun run dev` is running from the repo root.");
    throw error;
  }
}

export default globalSetup;
