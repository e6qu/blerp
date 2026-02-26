import { NextRequest, NextResponse } from "next/server";

export type BlerpMiddlewareOptions = {
  publicRoutes?: string[] | ((req: NextRequest) => boolean);
};

export function blerpMiddleware(options: BlerpMiddlewareOptions = {}) {
  return async (req: NextRequest) => {
    const { publicRoutes } = options;
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
