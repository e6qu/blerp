import { blerpSetup } from "@blerp/testing";

async function globalSetup() {
  try {
    await blerpSetup({
      baseUrl: process.env.BLERP_API_URL || "http://localhost:3000",
      secretKey: process.env.BLERP_SECRET_KEY,
      testUserId: "e2e_dashboard_user",
      testUserEmail: "e2e-dashboard@blerp.test",
    });
  } catch {
    console.warn("API server not available, E2E tests requiring auth will be skipped");
  }
}

export default globalSetup;
