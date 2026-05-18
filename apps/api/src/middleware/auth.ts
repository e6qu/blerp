import { Request, Response, NextFunction } from "express";
import * as schema from "../db/schema";
import { eq, and, ne } from "drizzle-orm";
import * as jose from "jose";
import { getKeyPair } from "../lib/keys";
import { logger } from "../lib/logger";
import { ForbiddenError } from "../lib/errors";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header("Authorization");
  const userId = req.header("X-User-Id");
  const organizationId = req.params.organization_id as string;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    // BUG-195 (codex r55): raw secret key path. The backend SDK and
    // documented `clerkClient()`-style integrations send
    // `Authorization: Bearer sk_…` — a raw value from the
    // `api_keys` table, NOT a JWT. Pre-r55 every non-JWT bearer fell
    // straight to the X-User-Id shim (which is gated by
    // NODE_ENV !== "production") so production SDK callers got 401
    // the moment we tightened the org / project routes (BUG-167+,
    // BUG-178, BUG-188, BUG-193, BUG-194). Look the token up in
    // this tenant's `api_keys` table: secret type + active +
    // belongs to a real project. Match grants tenant-root M2M
    // semantics (matches Clerk's sk_… contract — high-trust,
    // server-only, used to bootstrap further M2M tokens via the
    // chain-of-trust gate in `createM2MToken`).
    //
    // BUG-200 (codex r57): the `sk_`/`pk_` prefix MUST be checked
    // before using `.` as the JWT discriminator. Generated key
    // format is `sk_<tenantId>_<nanoid>` (see
    // ProjectService.createApiKey()) — when a tenant id contains a
    // dot (`demo.tenant`, customer-domain-style ids, etc.) the key
    // string contains a dot and the prior guard
    // `!token.includes(".") && token.startsWith("sk_")` skipped this
    // branch, sending the raw key into jwtVerify and rejecting it as
    // a malformed JWT. Prefix wins now.
    if (token.startsWith("sk_") || token.startsWith("pk_")) {
      // Publishable keys (`pk_…`) are client-visible and MUST NOT be
      // honored as admin auth — reject early so a misconfigured
      // frontend that forwards its `pk_` to the server doesn't
      // accidentally elevate.
      if (token.startsWith("pk_")) {
        res.status(401).json({
          error: "Publishable keys cannot authenticate API requests. Use a secret key (sk_…).",
        });
        return;
      }
      const apiKey = await req.tenantDb!.query.apiKeys.findFirst({
        where: and(
          eq(schema.apiKeys.key, token),
          eq(schema.apiKeys.type, "secret"),
          eq(schema.apiKeys.status, "active"),
        ),
      });
      if (!apiKey) {
        res.status(401).json({ error: "Invalid secret key" });
        return;
      }
      // Touch lastUsedAt asynchronously — best-effort, fire-and-
      // forget. Failures here must not block the request.
      //
      // BUG-206 (codex r59): drizzle update().set().where() is a
      // builder, not a query — `void` discards the builder without
      // ever executing the SQL. Call `.execute()` (or await — but
      // we don't want to block) to actually run the update.
      // Swallow rejections so a transient DB error doesn't crash
      // the request lifecycle.
      void req
        .tenantDb!.update(schema.apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(schema.apiKeys.id, apiKey.id))
        .execute()
        .catch((err: unknown) => {
          logger.warn({ err, apiKeyId: apiKey.id }, "Failed to touch api_keys.last_used_at");
        });
      // Secret key = tenant-root M2M. Grants the full project-bound
      // scope set + tenant-wide scopes for users/SCIM. This matches
      // Clerk's sk_ contract: the secret key is admin-equivalent.
      // For least-privilege app-tier ops, customers should mint a
      // restricted M2M token via POST /v1/m2m-tokens (chain-of-trust
      // in BUG-186 / BUG-187 still applies).
      req.m2m = {
        clientId: `api_key:${apiKey.id}`,
        scopes: [
          "users:read",
          "users:write",
          "users:admin",
          "webhooks:read",
          "webhooks:write",
          "audit_logs:read",
          "usage:read",
          "org:read",
          "org:write",
          "org:admin",
          "members:read",
          "members:write",
          "invitations:read",
          "invitations:write",
          "signup_restrictions:read",
          "signup_restrictions:admin",
          "redirect_urls:read",
          "redirect_urls:admin",
          "projects:read",
          "projects:write",
          "projects:admin",
          "api_keys:read",
          "api_keys:write",
          "api_keys:admin",
        ],
        projectId: apiKey.projectId,
      };
      next();
      return;
    }

    if (token.includes(".")) {
      try {
        const { publicKey } = await getKeyPair();
        const { payload } = await jose.jwtVerify(token, publicKey, {
          issuer: "blerp",
          audience: "blerp-api",
        });

        // M2M token: has client_id + scope
        if (payload.client_id && payload.scope) {
          // BUG-149 (codex r34) / BUG-151 (codex r35): verify the
          // token belongs to the request's tenant. The signing keypair
          // is SHARED across tenants, so without this check a token
          // minted in tenant A could be replayed against tenant B by
          // setting X-Tenant-Id. There are two cohorts:
          //
          //   (a) Modern tokens (r34+) carry `tenant_id` in the JWT.
          //       Match must be exact.
          //   (b) Pre-r34 tokens may have `project_id` but no
          //       `tenant_id`. We MUST validate against the current
          //       tenant's DB — the token won't exist in the wrong
          //       tenant's DB so the lookup rejects the replay.
          //
          // BUG-151 (codex r35): the prior version only did the DB
          // lookup when project_id was ABSENT. A pre-r34 token with
          // BOTH project_id AND no tenant_id slipped through. Fix:
          // perform the DB lookup whenever tenant_id is missing,
          // regardless of project_id presence.
          const jwtTenantId = payload.tenant_id as string | undefined;
          const reqTenantId = req.tenantId;
          if (jwtTenantId && reqTenantId && jwtTenantId !== reqTenantId) {
            res.status(401).json({
              error: "M2M token is scoped to a different tenant",
            });
            return;
          }

          let projectId = (payload.project_id as string | undefined) ?? "";
          if (!jwtTenantId) {
            // Tenant-binding fallback for legacy tokens: confirm the
            // clientId exists in THIS tenant's DB. Done regardless of
            // project_id presence (BUG-151).
            const row = await req.tenantDb!.query.m2mTokens.findFirst({
              where: eq(schema.m2mTokens.clientId, payload.client_id as string),
            });
            if (!row) {
              res.status(401).json({ error: "M2M token not recognised in this tenant" });
              return;
            }
            // Prefer the DB row's project_id (source of truth) over
            // whatever the JWT carried — protects against a tampered
            // token claiming a different project.
            projectId = row.projectId;
          }
          req.m2m = {
            clientId: payload.client_id as string,
            scopes: (payload.scope as string).split(" "),
            projectId,
          };
          next();
          return;
        }

        // User session token: has sub (user ID)
        if (payload.sub) {
          // BUG-155 (codex r37): session JWTs are tenant-bound at sign
          // time. authMiddleware verifies the tenant matches. Pre-fix
          // a session from tenant A could be replayed against tenant B
          // via X-Tenant-Id. Sessions minted before this change have
          // no tenant_id; honor them in dev (NODE_ENV !== "production")
          // for back-compat but reject in production.
          const jwtTenantId = payload.tenant_id as string | undefined;
          const reqTenantId = req.tenantId;
          if (jwtTenantId) {
            if (reqTenantId && jwtTenantId !== reqTenantId) {
              res.status(401).json({ error: "Session is scoped to a different tenant" });
              return;
            }
          } else if (process.env.NODE_ENV === "production") {
            res.status(401).json({ error: "Session token is missing tenant binding" });
            return;
          }
          req.user = { id: payload.sub };

          // BUG-147 (codex r33) / CI-fix: in non-production, ALSO
          // attach a dev-shim M2M context to session JWTs so the
          // dashboard (which authenticates via session, not M2M) can
          // hit the new scope-gated admin routes. Tests that want to
          // verify the production-style "session is NOT admin"
          // semantics opt out with `X-No-Dev-Shim: true`.
          const optedOut = req.header("X-No-Dev-Shim") === "true";
          if (process.env.NODE_ENV !== "production" && !req.m2m && !optedOut) {
            req.m2m = {
              clientId: `dev-shim-session:${payload.sub}`,
              scopes: [
                "users:read",
                "users:write",
                "users:admin",
                "webhooks:read",
                "webhooks:write",
                "audit_logs:read",
                "usage:read",
                "org:read",
                "org:write",
                "org:admin",
                "members:read",
                "members:write",
                "invitations:read",
                "invitations:write",
                "signup_restrictions:read",
                "signup_restrictions:admin",
                "redirect_urls:read",
                "redirect_urls:admin",
                // BUG-188 (codex r52): project + API-key write paths
                // now require an explicit scope on the M2M branch.
                // Dev-shim grants the full set so tests don't have to
                // thread tokens through every request.
                "projects:read",
                "projects:write",
                "projects:admin",
                "api_keys:read",
                "api_keys:write",
                "api_keys:admin",
              ],
              projectId: "dev-shim",
            };
          }
          if (organizationId) {
            const db = req.tenantDb!;
            const membership = await db.query.memberships.findFirst({
              where: and(
                eq(schema.memberships.userId, payload.sub),
                eq(schema.memberships.organizationId, organizationId),
              ),
            });
            if (membership) {
              req.membership = { id: membership.id, role: membership.role };
            }
          }
          next();
          return;
        }
      } catch {
        // Bearer token provided but JWT verification failed — reject
        res.status(401).json({ error: "Invalid or expired token" });
        return;
      }
    }
  }

  // X-User-Id fallback: only allowed in non-production environments
  if (userId) {
    if (process.env.NODE_ENV === "production") {
      res.status(401).json({ error: "X-User-Id header is not allowed in production" });
      return;
    }

    logger.warn(
      { userId, path: req.path },
      "Request authenticated via X-User-Id header (dev-mode fallback)",
    );
    req.user = { id: userId };

    if (organizationId) {
      const db = req.tenantDb!;
      const membership = await db.query.memberships.findFirst({
        where: and(
          eq(schema.memberships.userId, userId),
          eq(schema.memberships.organizationId, organizationId),
        ),
      });

      if (membership) {
        req.membership = { id: membership.id, role: membership.role };
      }
    }

    // BUG-147 (codex r33) / BUG-156 (codex r37): in dev mode the
    // X-User-Id shim auto-grants tenant-root scopes so tests pass
    // every M2M-scope and RBAC gate. NODE_ENV !== "production"
    // already gates this above; the grant is therefore impossible in
    // production. New scopes added by future hardening should be
    // appended here so the dev contract stays "X-User-Id = tenant
    // root."
    //
    // BUG-186 (codex r51): honor `X-No-Dev-Shim: true` here too —
    // the same opt-out the session-JWT path uses to simulate
    // production semantics. Without it, integration tests that try
    // to verify a project-owner CAN'T mint tenant-wide M2M scopes
    // (the BUG-186 gate) would still receive the X-User-Id shim's
    // wildcard scope set and falsely pass.
    const xUserIdOptedOut = req.header("X-No-Dev-Shim") === "true";
    if (!xUserIdOptedOut) {
      req.m2m = {
        clientId: `dev-shim:${userId}`,
        scopes: [
          "users:read",
          "users:write",
          "users:admin",
          "webhooks:read",
          "webhooks:write",
          "audit_logs:read",
          "usage:read",
          "org:read",
          "org:write",
          "org:admin",
          "members:read",
          "members:write",
          "invitations:read",
          "invitations:write",
          // BUG-169 (codex r43) / BUG-171 (codex r44): tenant-admin
          // scopes. Write paths use `:admin` so the chain-of-trust gate
          // in createM2MToken prevents a plain project owner minting.
          "signup_restrictions:read",
          "signup_restrictions:admin",
          "redirect_urls:read",
          "redirect_urls:admin",
          // BUG-188 (codex r52): see session-JWT shim block above.
          "projects:read",
          "projects:write",
          "projects:admin",
          "api_keys:read",
          "api_keys:write",
          "api_keys:admin",
        ],
        projectId: "dev-shim",
      };
    }

    next();
    return;
  }

  res.status(401).json({ error: "Authorization header is required" });
}

/**
 * BUG-138 (codex r29) / BUG-145 (codex r32): admin-only gate. Run
 * AFTER `authMiddleware`. Accepts only M2M tokens (Clerk-style backend
 * / secret-key auth) and, when `requiredScope` is passed, only those
 * carrying that scope.
 *
 * The scope check is the answer to BUG-145: bare `requireM2M` accepted
 * any M2M token from any project, so a project-A admin token could
 * unlock project-B's users (tenant-wide privilege escalation). With
 * a required scope like `users:admin`, the caller must have been
 * explicitly granted that scope at M2M-token creation. createM2MToken
 * refuses to grant `*:admin` scopes to plain project-owner sessions —
 * only an existing M2M token can mint another with admin scopes
 * (chain of trust). The first admin token bootstraps via seed / direct
 * DB access (one-time, tenant install).
 */
export function requireM2M(req: Request, res: Response, next: NextFunction): void;
export function requireM2M(
  requiredScope: string,
): (req: Request, res: Response, next: NextFunction) => void;
export function requireM2M(
  ...args: [string] | [Request, Response, NextFunction]
): void | ((req: Request, res: Response, next: NextFunction) => void) {
  // BUG-223 (codex r70): route every 403 through `ForbiddenError` so
  // the central error handler emits the dual `{ error, errors[] }`
  // envelope (BUG-47). Pre-r70 these gates wrote `res.status(403)
  // .json({ error: { message } })` directly — generated clients +
  // `throwIfError()` callers read `body.error.code` / `errors[]` and
  // saw `undefined` for these gates only.
  if (args.length === 1) {
    const requiredScope = args[0];
    return (req, _res, next) => {
      if (!req.m2m) {
        return next(
          new ForbiddenError(
            "Admin-only endpoint — requires an M2M / secret-key token, not a user session.",
          ),
        );
      }
      if (!req.m2m.scopes.includes(requiredScope)) {
        return next(
          new ForbiddenError(`M2M token is missing the required scope "${requiredScope}".`),
        );
      }
      next();
    };
  }
  const [req, , next] = args;
  if (req.m2m) {
    next();
    return;
  }
  next(
    new ForbiddenError(
      "Admin-only endpoint — requires an M2M / secret-key token (backend SDK), not a user session.",
    ),
  );
}

/**
 * BUG-220 (cleanup, post-r67): consolidate the duplicated
 * tenant-root predicate that lived in audit.controller (BUG-205/207)
 * and organization.controller (BUG-219). Both encode the same idea
 * — "this caller has tenant-wide authority and the per-project
 * scope filter should be skipped" — but differ on dev-shim
 * treatment, which is opt-in via the `devShimIsTenantRoot` option.
 *
 * Signals that imply tenant-root:
 *   1. `api_key:` clientId — a raw `sk_…` secret key per BUG-195.
 *      Clerk's `sk_` contract is admin-equivalent.
 *   2. Any scope in TENANT_ROOT_ADMIN_SCOPES — these are the four
 *      tenant-wide admin scopes mintable only via the chain-of-
 *      trust gate (BUG-186/187/207), so possession already implies
 *      tenant authority.
 *   3. The dev X-User-Id shim, OPTIONALLY (default `true`) so tests
 *      don't have to mint a real `sk_` for every admin operation.
 *      The org-list controller passes `{ devShimIsTenantRoot: false }`
 *      because BUG-178's contract is that dev-shim sessions behave
 *      like production sessions for that surface.
 *
 * Returns `false` for the absence of `req.m2m` — callers admit
 * session-only callers through their own helper (e.g.
 * `requireScopeOrTenantAdmin` uses `isSessionTenantAdmin`).
 */
export const TENANT_ROOT_ADMIN_SCOPES: ReadonlySet<string> = new Set([
  "users:admin",
  "signup_restrictions:admin",
  "redirect_urls:admin",
  "usage:admin",
]);

export function isTenantRootM2M(
  req: Request,
  options: { devShimIsTenantRoot?: boolean } = {},
): boolean {
  const m2m = req.m2m;
  if (!m2m) return false;
  const devShimIsTenantRoot = options.devShimIsTenantRoot ?? true;
  if (m2m.clientId.startsWith("dev-shim")) return devShimIsTenantRoot;
  if (m2m.clientId.startsWith("api_key:")) return true;
  return m2m.scopes.some((s) => TENANT_ROOT_ADMIN_SCOPES.has(s));
}

/**
 * BUG-209 (codex r61): admit session-authenticated tenant admins to
 * tenant-wide endpoints that the dashboard needs (e.g. `users:read`,
 * `users:write`). Pre-r61 `/v1/users` was strict `requireM2M(...)`,
 * which 403'd the in-repo dashboard in production — the dashboard
 * authenticates with the user's session JWT, not a secret key.
 *
 * "Tenant admin" = session user who owns at least one project in
 * this tenant. Project owners are the tenant's designated admins by
 * model — this isn't a privilege escalation: a project owner already
 * has full authority over their project (BUG-144) and can mint a
 * tenant-root M2M token via the chain-of-trust gate (BUG-186/187)
 * anyway. The session shortcut just spares the dashboard from
 * minting a server-side key on every navigation.
 *
 * Strict `requireM2M("…:admin")` paths (e.g. unlock — BUG-138) stay
 * M2M-only and are NOT routed through this helper — those high-
 * trust operations require an explicit admin credential for the
 * audit trail.
 */
/**
 * BUG-218 (codex r67): "tenant admin" = a session user who owns
 * EVERY project in this tenant. The pre-r67 "owns any project"
 * definition broke the security model in multi-project tenants:
 * project-A's owner could exercise tenant-wide `users:*` operations
 * (via the dashboard) against project-B's users, contradicting
 * BUG-186 which explicitly bars project-owner sessions from minting
 * tenant-wide privileged scopes.
 *
 * Semantics:
 *   - Single-project tenant (the common deploy): the project owner
 *     is the tenant admin. Dashboard works.
 *   - Multi-project tenant where one user owns ALL projects: that
 *     user is the tenant admin.
 *   - Multi-project tenant with split ownership: no user qualifies
 *     as a tenant admin via session; admin operations require an
 *     `sk_` secret key (which has tenant-root semantics per BUG-195)
 *     or a chain-of-trust-minted tenant-wide M2M token (BUG-186).
 */
export async function isSessionTenantAdmin(req: Request): Promise<boolean> {
  if (!req.user || !req.tenantDb) return false;
  // Tenant admin iff there is NO project in this tenant that
  // someone other than req.user owns. Implemented as "find any
  // not-owned-by-me project" — if none exists, they own them all.
  const notOwnedByCaller = await req.tenantDb.query.projects.findFirst({
    where: ne(schema.projects.ownerUserId, req.user.id),
  });
  if (notOwnedByCaller) return false;
  // Also require they own AT LEAST one project (otherwise an empty-
  // projects tenant or a non-owner user would qualify trivially).
  const ownsAny = await req.tenantDb.query.projects.findFirst({
    where: eq(schema.projects.ownerUserId, req.user.id),
  });
  return !!ownsAny;
}

export function requireScopeOrTenantAdmin(
  requiredScope: string,
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  // BUG-235 (codex r75): route 403s through `next(new ForbiddenError())`
  // so the central error handler emits the dual `{ error, errors[] }`
  // envelope (BUG-47). Pre-r75 these gates wrote
  // `res.status(403).json({ error: { message } })` directly, so
  // generated openapi-fetch clients + `throwIfError()` helpers read
  // `body.error.code` as undefined for failures on the dashboard-
  // facing routes (`/v1/users`, `/v1/webhooks/endpoints`,
  // `/v1/audit_logs`, etc.). Same fix BUG-223 applied to `requireM2M`.
  return async (req, _res, next) => {
    if (req.m2m) {
      if (!req.m2m.scopes.includes(requiredScope)) {
        return next(
          new ForbiddenError(`M2M token is missing the required scope "${requiredScope}".`),
        );
      }
      next();
      return;
    }
    if (await isSessionTenantAdmin(req)) {
      next();
      return;
    }
    next(
      new ForbiddenError(
        `Requires an M2M / secret-key token with "${requiredScope}" or a session for ` +
          "a tenant admin (a user who owns every project in the tenant).",
      ),
    );
  };
}

/**
 * BUG-147 (codex r33): per-user access gate. Run AFTER `authMiddleware`.
 * Accepts:
 *   1. An M2M token with `requiredScope` (admin path).
 *   2. A session whose user is the target user (self-management).
 *
 * Use this for user CRUD endpoints that should support both:
 *   - Backend SDK / admin tooling (M2M with users:read or users:write)
 *   - End-user "manage my own profile" flows (session, self only)
 *
 * Compare to plain `requireM2M(scope)` which forbids session auth
 * entirely — that's right for admin-only ops like /unlock or /restore
 * or bulk operations.
 */
export function requireSelfOrM2M(
  requiredScope: string,
  userIdFrom: (req: Request) => string | undefined,
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req, res, next) => {
    const targetUserId = userIdFrom(req);
    if (!targetUserId) {
      res.status(400).json({ error: { message: "user_id is required" } });
      return;
    }
    if (req.m2m) {
      if (!req.m2m.scopes.includes(requiredScope)) {
        res.status(403).json({
          error: {
            message: `M2M token is missing the required scope "${requiredScope}".`,
          },
        });
        return;
      }
      next();
      return;
    }
    if (req.user && req.user.id === targetUserId) {
      next();
      return;
    }
    // BUG-211 (codex r62): also admit session tenant admins — the
    // dashboard's user-management edit flow (`useUser`,
    // `useUpdateUser`) needs to GET / PATCH OTHER users' rows.
    // BUG-218 (codex r67): "tenant admin" is "owns EVERY project in
    // this tenant", not "owns any" — see `isSessionTenantAdmin`.
    if (await isSessionTenantAdmin(req)) {
      next();
      return;
    }
    res.status(403).json({
      error: {
        message:
          "Only the user themselves, an M2M token with the required scope, or a session " +
          "tenant admin (project owner) can access this resource.",
      },
    });
  };
}

/**
 * BUG-144 (codex r31): per-project access gate. Run AFTER
 * `authMiddleware`. Accepts:
 *   1. An M2M token scoped to the same project (BUG-142).
 *   2. A session whose user is the project's `ownerUserId`.
 *
 * `projectIdFrom` extracts the project id from the request (usually
 * `req.params.project_id` or `req.body.project_id`). Returning
 * undefined makes the gate 400 with a clear message.
 *
 * This is the same pattern as `assertProjectOwnerOrM2M` in
 * m2m.controller.ts, lifted into middleware so project / API-key /
 * environment routes don't have to repeat the check inline.
 */
export function requireProjectAccess(
  projectIdFrom: (req: Request) => string | undefined,
  requiredScope?: string,
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req, res, next) => {
    const projectId = projectIdFrom(req);
    // BUG-167 (codex r43) dev-shim quality-of-life: when the dev
    // X-User-Id shim is in play and no project_id is supplied, treat
    // the request as tenant-root and let it through. The shim is
    // already gated by NODE_ENV !== "production"; this just spares
    // tests from threading project_id into every request.
    if (!projectId) {
      if (req.m2m?.clientId.startsWith("dev-shim")) {
        next();
        return;
      }
      res.status(400).json({ error: { message: "project_id is required" } });
      return;
    }
    if (req.m2m) {
      // BUG-147 dev shim: the X-User-Id fallback auto-grants
      // admin scopes with projectId="dev-shim". Treat that as a
      // wildcard so existing tests (which exercise project-scoped
      // routes via the dev shim) keep working. Production is
      // unaffected — the dev shim is gated by NODE_ENV.
      const isDevShim = req.m2m.clientId.startsWith("dev-shim");
      // BUG-231 (codex r73): tenant-root callers (raw `sk_` secret
      // keys per BUG-195; M2M with a tenant-wide `:admin` scope per
      // BUG-186/207) are exempt from the project-binding check.
      // Same exemption mirrors BUG-220 in `requirePermission` —
      // without it, an sk_ minted in project-A could list orgs
      // across the tenant (BUG-219) but then 403 on every cross-
      // project follow-up. Use `devShimIsTenantRoot: false` so dev-
      // shim continues through the wildcard branch (which is the
      // case immediately above for `!projectId` and below via the
      // `isDevShim` skip on the scope check).
      const isTenantRoot = isTenantRootM2M(req, { devShimIsTenantRoot: false });
      if (!isDevShim && !isTenantRoot && req.m2m.projectId !== projectId) {
        res.status(403).json({
          error: {
            message: "M2M token is scoped to a different project. Mint a token for this project.",
          },
        });
        return;
      }
      // BUG-188 (codex r52): scope check on the M2M branch. Pre-r52
      // any M2M with a matching project_id passed this gate, so a
      // read-only project token (`webhooks:read`) could call
      // `PUT/DELETE /v1/projects/:id` or rotate / create / revoke
      // API keys. Routes that mutate now pass an explicit scope so
      // the M2M caller has to actually hold it. Project-owner
      // sessions still pass via the user-owner branch below
      // (sessions have full authority over their project).
      if (requiredScope && !isDevShim && !req.m2m.scopes.includes(requiredScope)) {
        res.status(403).json({
          error: {
            message: `M2M token lacks the required scope: ${requiredScope}. Mint a token with this scope.`,
          },
        });
        return;
      }
      next();
      return;
    }
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: { message: "Authentication required." } });
      return;
    }
    const project = await req.tenantDb!.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
    });
    if (!project) {
      res.status(404).json({ error: { message: "Project not found." } });
      return;
    }
    if (project.ownerUserId !== userId) {
      res.status(403).json({
        error: {
          message: "Only the project owner or a project-scoped M2M token can manage this project.",
        },
      });
      return;
    }
    next();
  };
}
