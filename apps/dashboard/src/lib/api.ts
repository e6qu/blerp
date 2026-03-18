import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@blerp/shared";

export const DEMO_USER_ID = "demo_user";
const TENANT_ID = "demo-tenant";

let csrfToken: string | undefined;

async function fetchCsrfToken(): Promise<string | undefined> {
  const res = await fetch("/v1/csrf-token", {
    headers: { "X-Tenant-Id": TENANT_ID, "X-User-Id": DEMO_USER_ID },
    credentials: "include",
  });
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.csrfToken;
}

const csrfMiddleware: Middleware = {
  async onRequest({ request }) {
    const method = request.method.toUpperCase();
    if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      if (!csrfToken) {
        csrfToken = await fetchCsrfToken();
      }
      if (csrfToken) {
        request.headers.set("x-csrf-token", csrfToken);
      }
    }
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 403) {
      // CSRF token may have expired — refetch on next mutation
      csrfToken = undefined;
    }
    return response;
  },
};

export const client = createClient<paths>({
  baseUrl: "/",
  headers: {
    "X-Tenant-Id": TENANT_ID,
    "X-User-Id": DEMO_USER_ID,
  },
  credentials: "include",
});

client.use(csrfMiddleware);

export async function getCsrfToken(): Promise<string | undefined> {
  if (!csrfToken) {
    csrfToken = await fetchCsrfToken();
  }
  return csrfToken;
}
