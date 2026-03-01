import createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";

export const DEMO_USER_ID = "demo_user";

export const client = createClient<paths>({
  baseUrl: "/",
  headers: {
    "X-Tenant-Id": "demo-tenant",
    "X-User-Id": DEMO_USER_ID,
  },
});
