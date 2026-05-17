import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";
import { assertSatelliteNotConfigured, getApiUrl, getSignInUrl, getSignUpUrl } from "@blerp/shared";

// BUG-91 (round-2 sweep): satellite-domain SSO isn't implemented; refuse
// to start instead of silently routing users to the wrong domain.
assertSatelliteNotConfigured();

// BUG-84 (round-2 sweep) / BUG-100 (codex r18): honor CLERK_SIGN_IN_URL
// / CLERK_SIGN_UP_URL. The env values may be a path (e.g. `/sign-in`)
// OR a full URL (e.g. `https://auth.example.com/sign-in`) per Clerk's
// docs. Parse with a placeholder base so both forms produce a usable
// pathname for the bypass check; the redirect itself uses the raw
// string so external origins are honored.
//
// The bypass check ONLY skips when the inbound request is to the same
// origin as the configured URL (or the configured URL is a path-only
// value). Otherwise an external-host sign-in URL would always look
// "not yet on the sign-in page" and we'd redirect-loop.
const SIGN_IN_RAW = getSignInUrl();
const SIGN_UP_RAW = getSignUpUrl();
function parseAuthUrl(raw: string): { pathname: string; isAbsolute: boolean; origin?: string } {
  if (raw.startsWith("/")) return { pathname: raw, isAbsolute: false };
  const parsed = new URL(raw);
  return { pathname: parsed.pathname, isAbsolute: true, origin: parsed.origin };
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
  return reqPath.startsWith(cfg.pathname);
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
            signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
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
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
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
