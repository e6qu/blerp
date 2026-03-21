import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

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
      const token = req.cookies.get("__blerp_session")?.value;

      // Verify the token is actually valid (not just present)
      let tokenValid = false;
      if (token) {
        try {
          const apiUrl = process.env.BLERP_API_URL ?? "http://localhost:3000";
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
            const signInUrl = new URL("/sign-in", req.url);
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

    const token = req.cookies.get("__blerp_session")?.value;

    // Verify token is valid, not just present
    let tokenValid = false;
    if (token) {
      try {
        const apiUrl = process.env.BLERP_API_URL ?? "http://localhost:3000";
        const jwks = jose.createRemoteJWKSet(new URL(`${apiUrl}/v1/jwks`));
        await jose.jwtVerify(token, jwks, { issuer: "blerp", audience: "blerp-api" });
        tokenValid = true;
      } catch {
        // Invalid token
      }
    }

    if (
      !tokenValid &&
      !isPublic &&
      !req.nextUrl.pathname.startsWith("/sign-in") &&
      !req.nextUrl.pathname.startsWith("/sign-up")
    ) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
      const response = NextResponse.redirect(signInUrl);
      if (token) response.cookies.delete("__blerp_session");
      return response;
    }

    return NextResponse.next();
  };
}
