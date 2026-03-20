import { blerpMiddleware, createRouteMatcher } from "@blerp/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api(.*)"]);

export default blerpMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and /v1 API proxy routes
    "/((?!_next|v1/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for local API routes (not /v1 proxy)
    "/(api|trpc)(.*)",
  ],
};
