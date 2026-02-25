import { doubleCsrf } from "csrf-csrf";
import { Request } from "express";

export const { invalidCsrfTokenError, generateCsrfToken, validateRequest, doubleCsrfProtection } =
  doubleCsrf({
    getSecret: () => "super-secret-csrf-key", // In real app, use env
    getSessionIdentifier: (req: Request) => req.cookies?.__blerp_session || req.ip || "anonymous",
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
    skipCsrfProtection: () => process.env.NODE_ENV === "test",
  });
