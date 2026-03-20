import { NextRequest, NextResponse } from "next/server";

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

      const auth = (): AuthObject => ({
        protect() {
          if (!token) {
            const signInUrl = new URL("/sign-in", req.url);
            signInUrl.searchParams.set("redirect_url", req.url);
            throw signInUrl;
          }
        },
      });

      try {
        await callback(auth, req);
      } catch (thrown: unknown) {
        if (thrown instanceof URL) {
          return NextResponse.redirect(thrown);
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

    if (
      !token &&
      !isPublic &&
      !req.nextUrl.pathname.startsWith("/sign-in") &&
      !req.nextUrl.pathname.startsWith("/sign-up")
    ) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  };
}
