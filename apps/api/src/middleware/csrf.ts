import { doubleCsrf } from "csrf-csrf";
import { Request } from "express";

export const { invalidCsrfTokenError, generateCsrfToken, validateRequest, doubleCsrfProtection } =
  doubleCsrf({
    getSecret: () => "super-secret-csrf-key", // In real app, use env
    getSessionIdentifier: (req: Request) =>
      // BUG-51: read either cookie name so a Clerk-compat caller setting
      // only `__session` still has a stable CSRF session identifier.
      req.cookies?.__blerp_session || req.cookies?.__session || req.ip || "anonymous",
    cookieName: "__blerp_csrf",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getCsrfTokenFromRequest: (req: Request) => req.headers["x-csrf-token"] as string | undefined,
    // BUG-198 (codex r56): skip CSRF for server-to-server callers
    // identified by Bearer auth without a session cookie. The
    // double-submit-cookie pattern protects browser-borne sessions
    // (where the attacker can't read the cookie but can issue cross-
    // site requests). Backend SDK / `@blerp/backend` /
    // `clerkClient()` invocations send `Authorization: Bearer sk_…`
    // (BUG-195) or a project-scoped M2M JWT (BUG-186/187) with NO
    // cookies — they're server-side, can't be victims of CSRF, and
    // have no way to obtain or send `x-csrf-token` + `__blerp_csrf`.
    // Pre-r56, every backend-SDK mutation 403'd on CSRF before
    // authMiddleware even ran. Skip only when bearer auth is present
    // AND no session cookie is set — a browser session still has its
    // CSRF gate.
    skipCsrfProtection: (req: Request) => {
      if (process.env.NODE_ENV === "test") return true;
      const hasBearer =
        typeof req.headers.authorization === "string" &&
        req.headers.authorization.startsWith("Bearer ");
      const hasSessionCookie = !!(req.cookies?.__blerp_session || req.cookies?.__session);
      return hasBearer && !hasSessionCookie;
    },
  });
