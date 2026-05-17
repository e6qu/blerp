import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { assertSatelliteNotConfigured, getApiUrl, getSignInUrl, getSignUpUrl } from "@blerp/shared";

// BUG-91 (round-2 sweep): satellite-domain SSO isn't implemented; refuse
// to start instead of silently routing users to the wrong domain.
assertSatelliteNotConfigured();

// BUG-84 (round-2 sweep) / BUG-100, BUG-110, BUG-111 (codex r18, r19):
// honor CLERK_SIGN_IN_URL / CLERK_SIGN_UP_URL. The env values may be:
//   - A path with optional query (e.g. `/sign-in`, `/sign-in?next=x`).
//   - A same-origin or external full URL (e.g.
//     `https://auth.example.com/sign-in`).
// parseAuthUrl always feeds the value through `new URL(..., placeholder)`
// so query strings / fragments are stripped from the pathname (BUG-111).
// Non-http(s) schemes (`javascript:`, `mailto:`, ...) are rejected at
// boot so they can't sneak into a redirect target.
//
// isOnAuthPage applies boundary-aware matching so `/sign-infoo` is NOT
// treated as the sign-in page and `/` matches only `/` exactly
// (BUG-110). Cross-origin URLs return false because the inbound Next.js
// request is never "on" the external host.
const PLACEHOLDER_BASE = "https://blerp-middleware.invalid";
const SIGN_IN_RAW = getSignInUrl();
const SIGN_UP_RAW = getSignUpUrl();
function parseAuthUrl(raw: string): { pathname: string; isAbsolute: boolean; origin?: string } {
  const parsed = new URL(raw, PLACEHOLDER_BASE);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Invalid auth URL: scheme "${parsed.protocol}" not allowed for CLERK_SIGN_IN_URL / ` +
        `CLERK_SIGN_UP_URL (only http: and https: are supported). Got: ${raw}`,
    );
  }
  const isAbsolute = !raw.startsWith("/");
  return {
    pathname: parsed.pathname,
    isAbsolute,
    origin: isAbsolute ? parsed.origin : undefined,
  };
}
const SIGN_IN = parseAuthUrl(SIGN_IN_RAW);
const SIGN_UP = parseAuthUrl(SIGN_UP_RAW);
function isOnAuthPage(
  reqOrigin: string,
  reqPath: string,
  cfg: { pathname: string; isAbsolute: boolean; origin?: string },
): boolean {
  if (cfg.isAbsolute && cfg.origin !== reqOrigin) {
    // External sign-in host — the inbound request is never "on" it.
    return false;
  }
  // Boundary-aware: exact match OR cfg.pathname followed by `/`. Special-
  // case `/` to exact-match only, otherwise every request would bypass.
  if (cfg.pathname === "/") return reqPath === "/";
  return reqPath === cfg.pathname || reqPath.startsWith(cfg.pathname + "/");
}

export type BlerpMiddlewareOptions = {
  publicRoutes?: string[] | ((req: NextRequest) => boolean);
};

type AuthObject = {
  protect: () => void;
};

type MiddlewareCallback = (auth: () => AuthObject, req: NextRequest) => void | Promise<void>;

/**
 * Convert Clerk-style route patterns to regex matchers.
 * Supports patterns like `/sign-in(.*)`, `/api/(.*)`, `/dashboard`.
 */
export function createRouteMatcher(patterns: string[]): (req: NextRequest) => boolean {
  const regexes = patterns.map((pattern) => {
    // Replace (.*) with a regex wildcard, escape dots in the rest of the path
    const regexStr = pattern
      .replace(/\(\.?\*\)/g, "__WILDCARD__")
      .replace(/\./g, "\\.")
      .replace(/__WILDCARD__/g, ".*");
    return new RegExp(`^${regexStr}$`);
  });

  return (req: NextRequest) => regexes.some((re) => re.test(req.nextUrl.pathname));
}

/**
 * Middleware supporting two forms:
 * 1. Options form: `blerpMiddleware({ publicRoutes: [...] })`
 * 2. Callback form: `blerpMiddleware((auth, req) => { ... })` — Clerk compatibility
 */
export function blerpMiddleware(
  optionsOrCallback: BlerpMiddlewareOptions | MiddlewareCallback = {},
) {
  // Callback form: blerpMiddleware((auth, req) => { if (!isPublic(req)) auth().protect(); })
  if (typeof optionsOrCallback === "function") {
    const callback = optionsOrCallback;
    return async (req: NextRequest) => {
      const token =
        req.cookies.get("__blerp_session")?.value ?? req.cookies.get("__session")?.value;

      // Verify the token is actually valid (not just present)
      let tokenValid = false;
      if (token) {
        try {
          const apiUrl = getApiUrl();
          const jwks = jose.createRemoteJWKSet(new URL(`${apiUrl}/v1/jwks`));
          await jose.jwtVerify(token, jwks, { issuer: "blerp", audience: "blerp-api" });
          tokenValid = true;
        } catch {
          // Token is invalid/expired — treat as unauthenticated
        }
      }

      const auth = (): AuthObject => ({
        protect() {
          if (!tokenValid) {
            const signInUrl = new URL(SIGN_IN_RAW, req.url);
            // BUG-117 (codex r20): preserve query string + hash on the
            // redirected-from URL. `/dashboard?tab=settings` should
            // round-trip back to the same page after sign-in, not bare
            // `/dashboard`.
            signInUrl.searchParams.set(
              "redirect_url",
              req.nextUrl.pathname + req.nextUrl.search + req.nextUrl.hash,
            );
            throw signInUrl;
          }
        },
      });

      try {
        await callback(auth, req);
      } catch (thrown: unknown) {
        if (thrown instanceof URL) {
          const response = NextResponse.redirect(thrown);
          // Clear invalid session cookie so user doesn't get stuck in a loop
          if (!tokenValid && token) {
            response.cookies.delete("__blerp_session");
            response.cookies.delete("__session");
          }
          return response;
        }
        throw thrown;
      }

      return NextResponse.next();
    };
  }

  // Options form (original)
  const { publicRoutes } = optionsOrCallback;
  return async (req: NextRequest) => {
    const isPublic =
      typeof publicRoutes === "function"
        ? publicRoutes(req)
        : publicRoutes?.includes(req.nextUrl.pathname);

    const token = req.cookies.get("__blerp_session")?.value ?? req.cookies.get("__session")?.value;

    // Verify token is valid, not just present
    let tokenValid = false;
    if (token) {
      try {
        const apiUrl = getApiUrl();
        const jwks = jose.createRemoteJWKSet(new URL(`${apiUrl}/v1/jwks`));
        await jose.jwtVerify(token, jwks, { issuer: "blerp", audience: "blerp-api" });
        tokenValid = true;
      } catch {
        // Invalid token
      }
    }

    const reqOrigin = req.nextUrl.origin;
    const reqPath = req.nextUrl.pathname;
    if (
      !tokenValid &&
      !isPublic &&
      !isOnAuthPage(reqOrigin, reqPath, SIGN_IN) &&
      !isOnAuthPage(reqOrigin, reqPath, SIGN_UP)
    ) {
      const signInUrl = new URL(SIGN_IN_RAW, req.url);
      // BUG-117 (codex r20): preserve query + hash (see same fix above).
      signInUrl.searchParams.set(
        "redirect_url",
        req.nextUrl.pathname + req.nextUrl.search + req.nextUrl.hash,
      );
      const response = NextResponse.redirect(signInUrl);
      if (token) {
        response.cookies.delete("__blerp_session");
        response.cookies.delete("__session");
      }
      return response;
    }

    return NextResponse.next();
  };
}
