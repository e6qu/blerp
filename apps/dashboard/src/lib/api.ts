import createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";

export const client = createClient<paths>({
  baseUrl: "/",
  headers: {
    "X-Tenant-Id": "demo-tenant",
  },
});
