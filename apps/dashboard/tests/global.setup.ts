import { blerpSetup } from "@blerp/testing";
import { test as setup } from "@playwright/test";

setup.describe.configure({ mode: "serial" });

setup("create test user and obtain testing token", async () => {
  await blerpSetup({
    baseUrl: process.env.BLERP_API_URL || "http://localhost:3000",
    secretKey: process.env.BLERP_SECRET_KEY,
    testUserId: "e2e_dashboard_user",
    testUserEmail: "e2e-dashboard@blerp.test",
  });
});
