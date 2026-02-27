import createClient from "openapi-fetch";
import type { paths } from "@blerp/shared";

export const client = createClient<paths>({
  baseUrl: "http://localhost:3000/v1",
  headers: { "X-Tenant-Id": "demo-tenant" },
});
