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
 */

const BLERP_SESSION = "__blerp_session";
const CLERK_SESSION = "__session";

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
}

export function clearSessionCookies(): void {
  Cookies.remove(BLERP_SESSION);
  Cookies.remove(CLERK_SESSION);
}

/** Returns the session token from either cookie (BLERP first, CLERK as alias). */
export function readSessionCookie(): string | undefined {
  return Cookies.get(BLERP_SESSION) ?? Cookies.get(CLERK_SESSION);
}
