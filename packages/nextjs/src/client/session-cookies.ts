import Cookies from "js-cookie";

/*
 * Dual-cookie session helpers (BUG-51).
 *
 * Blerp's native session cookie is `__blerp_session`. Clerk-compat
 * consumers (customer middleware that reads cookies directly without
 * going through `@blerp/nextjs/server`'s `auth()`) expect `__session`.
 * We set both on every sign-in / token refresh and clear both on
 * sign-out so a customer porting their Clerk middleware finds the same
 * cookie name they're already reading.
 *
 * Read paths inside `@blerp/nextjs` still prefer `__blerp_session`
 * (own name first; `__session` is the alias). If a customer needs to
 * read the cookie themselves, they can read either.
 *
 * BUG-72 (codex r10): when the issued JWT carries an `org_id` claim
 * (single-org users get one stamped at sign-in by AuthService — see
 * BUG-49 / BUG-53), we also write the `__blerp_org` cookie so the
 * client `useAuth().orgId` matches what server `auth().orgId` returns.
 * Without this, the JWT tells the server about an active org but the
 * client BlerpProvider stays at `orgId: null` (it only initializes
 * from the cookie) — drift between SSR and hydration.
 */

const BLERP_SESSION = "__blerp_session";
const CLERK_SESSION = "__session";
const BLERP_ORG = "__blerp_org";

/**
 * Best-effort JWT payload decode (no verification — the cookie helper
 * is for setting client-side state mirrors, not authorization). Returns
 * undefined on any parse failure.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | undefined {
  const [, payloadB64] = token.split(".");
  if (!payloadB64) return undefined;
  try {
    // base64url → base64 → utf8 JSON.
    //
    // BUG-222 (codex r70): JWT payload segments are unpadded
    // base64url. Browser `atob()` requires standard base64 padding
    // (length must be a multiple of 4); without it, `atob` throws
    // and the catch below silently dropped `org_id`. Single-org
    // users then hydrated with `useAuth().orgId === null` despite
    // the server JWT carrying the claim. Pad with `=` to the next
    // multiple of 4 before decoding.
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded =
      typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

interface SessionCookieOptions {
  expiresDays?: number;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  path?: string;
}

export function setSessionCookies(accessToken: string, options: SessionCookieOptions = {}): void {
  const opts = {
    expires: options.expiresDays ?? 7,
    sameSite: options.sameSite ?? "lax",
    path: options.path ?? "/",
    ...(options.secure !== undefined ? { secure: options.secure } : {}),
  };
  Cookies.set(BLERP_SESSION, accessToken, opts);
  Cookies.set(CLERK_SESSION, accessToken, opts);

  // BUG-72 (codex r10): mirror the JWT's `org_id` claim into the
  // `__blerp_org` cookie so client and server agree on the active org
  // immediately after sign-in. AuthService only stamps the claim for
  // single-org users (BUG-53), so for multi-org users this is a no-op
  // and the OrganizationSwitcher drives cookie state.
  //
  // BUG-236 (codex r76): clear a stale `__blerp_org` cookie when the
  // new session token does NOT carry `org_id`. Pre-r76 a previous
  // single-org session left `__blerp_org` set; signing in to a multi-
  // org account (no `org_id` claim) or a different account inherited
  // the previous user's org cookie. `BlerpProvider` then initialised
  // `orgId` from that stale value and client/server auth state
  // diverged until the user manually switched orgs. Conservative
  // semantic: every call to `setSessionCookies()` is treated as a
  // session replacement — clear the org cookie unless the new JWT
  // explicitly carries `org_id`.
  const payload = decodeJwtPayload(accessToken);
  if (payload && typeof payload.org_id === "string" && payload.org_id) {
    Cookies.set(BLERP_ORG, payload.org_id, opts);
  } else {
    Cookies.remove(BLERP_ORG, { path: opts.path });
  }
}

export function clearSessionCookies(): void {
  Cookies.remove(BLERP_SESSION);
  Cookies.remove(CLERK_SESSION);
  Cookies.remove(BLERP_ORG);
}

/** Returns the session token from either cookie (BLERP first, CLERK as alias). */
export function readSessionCookie(): string | undefined {
  return Cookies.get(BLERP_SESSION) ?? Cookies.get(CLERK_SESSION);
}
