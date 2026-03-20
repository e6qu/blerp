import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@blerp/shared";

const TENANT_ID = "demo-tenant";
const SESSION_TOKEN_KEY = "blerp_session_token";
const SESSION_USER_ID_KEY = "blerp_session_user_id";

// --- Session state ---

let sessionToken: string | null = null;
let sessionUserId: string | null = null;

// Hydrate from localStorage on module load
try {
  sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
  sessionUserId = localStorage.getItem(SESSION_USER_ID_KEY);
} catch {
  // SSR or restricted storage — ignore
}

export function setSession(token: string, userId: string) {
  sessionToken = token;
  sessionUserId = userId;
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.setItem(SESSION_USER_ID_KEY, userId);
  } catch {
    // Storage unavailable
  }
}

export function clearSession() {
  sessionToken = null;
  sessionUserId = null;
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_ID_KEY);
  } catch {
    // Storage unavailable
  }
}

export function getSessionUserId(): string | null {
  return sessionUserId;
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Tenant-Id": TENANT_ID,
  };
  if (sessionToken) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }
  return headers;
}

// --- CSRF ---

let csrfToken: string | undefined;

async function fetchCsrfToken(): Promise<string | undefined> {
  const res = await fetch("/v1/csrf-token", {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.csrfToken;
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    // Apply dynamic auth headers
    const headers = getAuthHeaders();
    for (const [key, value] of Object.entries(headers)) {
      if (!request.headers.has(key)) {
        request.headers.set(key, value);
      }
    }
    return request;
  },
};

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
  credentials: "include",
});

client.use(authMiddleware);
client.use(csrfMiddleware);

export async function getCsrfToken(): Promise<string | undefined> {
  if (!csrfToken) {
    csrfToken = await fetchCsrfToken();
  }
  return csrfToken;
}
