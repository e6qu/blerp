/* eslint-disable @typescript-eslint/no-explicit-any */
import createClient from "openapi-fetch";
// Note: In a real app, you would import paths from @blerp/shared or similar
// export const client = createClient<paths>({ baseUrl: "http://localhost:3000/v1" });

export const client = createClient<any>({
  baseUrl: "http://localhost:3000/v1",
  headers: { "X-Tenant-Id": "demo-tenant" },
});
