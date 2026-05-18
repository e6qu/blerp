/**
 * BUG-208 (codex r60): open-redirect guard for caller-supplied
 * post-auth navigation targets (e.g. `?redirect_url=…` query). An
 * attacker who can craft a link to `/sign-in?redirect_url=https://evil.com`
 * could otherwise phish a freshly-authenticated user to the
 * attacker's domain.
 *
 * BUG-220 (cleanup): lifted from the per-component duplicates in
 * `components/Auth.tsx` + `components/SignUp.tsx` so a third surface
 * adopting the pattern doesn't have to re-derive the rules.
 *
 * Accepts:
 *   - Relative paths starting with `/` and NOT `//` (protocol-
 *     relative) or `/\` (some browsers treat as protocol-relative).
 *   - Absolute URLs whose `origin` matches `window.location.origin`.
 *
 * Anything else (different host, `javascript:`, `data:`, malformed)
 * returns `false`. Callers treat `false` as "drop to undefined and
 * fall back to the runtime-config redirect resolution" — the
 * deployer's force/fallback URLs (BUG-201) are always safe by
 * construction.
 *
 * Server-side use (no `window`) is a no-op: returns `false` so
 * callers fall back to the safe default.
 */
export function isSafeRedirect(value: string): boolean {
  if (typeof window === "undefined") return false;
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return true;
  }
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Companion to `isSafeRedirect`: read `?redirect_url=` from the
 * current URL and return it only if it passes `isSafeRedirect`.
 * Returns `undefined` for blank, missing, server-side, or unsafe
 * values so callers can chain to a runtime fallback.
 */
export function readRedirectQueryParam(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const v = new URLSearchParams(window.location.search).get("redirect_url");
  if (!v || v.trim() === "") return undefined;
  return isSafeRedirect(v) ? v : undefined;
}
