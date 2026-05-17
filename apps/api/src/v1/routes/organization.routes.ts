import { Router } from "express";
import * as organizationController from "../controllers/organization.controller";
import * as membershipController from "../controllers/membership.controller";
import * as invitationController from "../controllers/invitation.controller";
import * as domainController from "../controllers/domain.controller";
import * as roleController from "../controllers/role.controller";
import { authMiddleware, requireProjectAccess } from "../../middleware/auth";
import { requirePermission } from "../../middleware/rbac";

const router = Router();

// Organizations — BUG-167 (codex r43): list and create were
// COMPLETELY unauthenticated. Anyone with X-Tenant-Id could enumerate
// every org (including private_metadata) or create cross-project orgs.
// OpenAPI marks both `SecretKey`. Gate with auth + project access.
// CREATE: project_id required in body (caller proves ownership).
// LIST: project_id required in query EXCEPT for `?domain=` lookups,
// which are a discovery primitive used by the OAuth sign-in path to
// resolve "which org owns this email domain" — that flow is
// pre-auth-session so it can't supply project_id, but it also only
// returns the matching org (filtered by verified domain), not
// arbitrary tenant data.
// BUG-194 (codex r54): create-org also needs an M2M scope check.
// Pre-r54 any project-scoped M2M token (even `webhooks:read`) could
// POST a new organization in its project because `requireProjectAccess`
// only validated project match. Project-owner sessions still pass
// through the user-owner branch.
router.post(
  "/organizations",
  authMiddleware,
  requireProjectAccess(
    (req) => (typeof req.body?.project_id === "string" ? req.body.project_id : undefined),
    "org:write",
  ),
  organizationController.createOrganization,
);
router.get(
  "/organizations",
  // BUG-167 (codex r43): domain-discovery (?domain=) is a pre-session
  // lookup (the OAuth sign-in flow uses it to resolve "which org owns
  // this email domain" before the user is authenticated). For that
  // narrow path, skip auth entirely.
  //
  // BUG-178 (codex r48): only require explicit project access when
  // `?project_id=` is supplied. Pre-r48 the gate 400'd when no
  // project_id was passed, which broke every authenticated caller
  // that the dashboard / Next.js SDK / backend SDK use today
  // (`useOrganizations`, `useGlobalSearch`, `OrganizationSwitcher`,
  // `CreateOrganization`'s suggested-orgs lookup). In dev the
  // X-User-Id shim was hiding this because dev-shim was a wildcard
  // (BUG-167/176/177). In production the same callers returned 400.
  //
  // New contract: auth required (session JWT or M2M); the controller
  // scopes the result to what the caller can actually see — orgs the
  // user is a member of, projects the user owns, or the M2M token's
  // project — so cross-project / cross-tenant enumeration is still
  // impossible. When `?project_id=` is supplied we additionally run
  // `requireProjectAccess` so the caller can't request a project they
  // don't own.
  //
  // BUG-193 (codex r54): LIST also leaks private_metadata to any
  // authenticated caller, so an M2M with an unrelated scope (e.g.
  // `webhooks:read`) could enumerate org private metadata via either
  // branch. Add an `org:read` scope check on both branches when the
  // caller is an M2M token; project-owner sessions still pass via
  // the user-owner / membership-derived path.
  (req, res, next) => {
    // BUG-202 (codex r58): require a NON-BLANK `domain` for the
    // discovery-bypass branch. Pre-r58 `typeof "" === "string"` so
    // `?domain=` (blank) skipped auth, then the controller treated
    // `domain` as falsy and the service ran the unfiltered list,
    // returning every org in the tenant (including `private_metadata`)
    // to an unauthenticated caller. Trim to coerce whitespace-only
    // queries to "blank" too.
    const rawDomain = req.query?.domain;
    if (typeof rawDomain === "string" && rawDomain.trim() !== "") return next();
    return authMiddleware(req, res, () => {
      if (typeof req.query?.project_id === "string") {
        return requireProjectAccess((r) => r.query.project_id as string, "org:read")(
          req,
          res,
          next,
        );
      }
      // BUG-193 (codex r54): no explicit project_id supplied. The
      // controller will scope by `req.m2m.projectId` or
      // `req.user.id`'s memberships, but we still need to gate the
      // M2M branch by scope — otherwise a `webhooks:read` token can
      // read orgs in its own project here. Sessions (and dev-shim)
      // pass through.
      const m2m = req.m2m;
      if (m2m && !m2m.clientId.startsWith("dev-shim")) {
        if (!m2m.scopes.includes("org:read")) {
          res.status(403).json({
            error: {
              message:
                "M2M token lacks the required scope: org:read. Mint a token with this scope.",
            },
          });
          return;
        }
      }
      return next();
    });
  },
  organizationController.listOrganizations,
);

// Resource-specific routes with RBAC
router.get(
  "/organizations/:organization_id",
  authMiddleware,
  requirePermission("org:read"),
  organizationController.getOrganization,
);
router.patch(
  "/organizations/:organization_id",
  authMiddleware,
  requirePermission("org:write"),
  organizationController.updateOrganization,
);
router.delete(
  "/organizations/:organization_id",
  authMiddleware,
  requirePermission("org:write"),
  organizationController.deleteOrganization,
);

// Leave organization (before memberships CRUD to avoid param collision)
router.post(
  "/organizations/:organization_id/leave",
  authMiddleware,
  membershipController.leaveOrganization,
);

// Memberships
//
// BUG-67 (codex r7): the /me route is gated only by authMiddleware so a
// custom-role user with `org:read` but not `members:read` can still
// discover their own membership row + resolved permissions. Without this
// path, `@blerp/nextjs auth()` would 403 against the LIST endpoint and
// leave `orgPermissions` empty, making `has({ permission: "org:read" })`
// return false for users who genuinely have that permission. Must be
// declared before the `:id` route so the literal "me" doesn't collide.
router.get(
  "/organizations/:organization_id/memberships/me",
  authMiddleware,
  membershipController.getOwnMembership,
);
router.post(
  "/organizations/:organization_id/memberships",
  authMiddleware,
  requirePermission("members:write"),
  membershipController.createMembership,
);
router.get(
  "/organizations/:organization_id/memberships",
  authMiddleware,
  requirePermission("members:read"),
  membershipController.listMemberships,
);
router.patch(
  "/organizations/:organization_id/memberships/:id",
  authMiddleware,
  requirePermission("members:write"),
  membershipController.updateMembership,
);
router.delete(
  "/organizations/:organization_id/memberships/:id",
  authMiddleware,
  requirePermission("members:write"),
  membershipController.deleteMembership,
);

// Invitations
router.post(
  "/organizations/:organization_id/invitations",
  authMiddleware,
  requirePermission("invitations:write"),
  invitationController.createInvitation,
);
router.get(
  "/organizations/:organization_id/invitations",
  authMiddleware,
  requirePermission("invitations:read"),
  invitationController.listInvitations,
);
router.post(
  "/organizations/:organization_id/invitations/:id/revoke",
  authMiddleware,
  requirePermission("invitations:write"),
  invitationController.revokeInvitation,
);

// Domains
router.post(
  "/organizations/:organization_id/domains",
  authMiddleware,
  requirePermission("org:write"),
  domainController.addDomain,
);
router.get(
  "/organizations/:organization_id/domains",
  authMiddleware,
  requirePermission("org:read"),
  domainController.listDomains,
);
router.delete(
  "/organizations/:organization_id/domains/:domain_id",
  authMiddleware,
  requirePermission("org:write"),
  domainController.deleteDomain,
);
router.post(
  "/organizations/:organization_id/domains/:domain_id/verify",
  authMiddleware,
  requirePermission("org:write"),
  domainController.verifyDomain,
);

// Custom Roles
router.get(
  "/organizations/:organization_id/roles",
  authMiddleware,
  requirePermission("org:read"),
  roleController.listRoles,
);
router.post(
  "/organizations/:organization_id/roles",
  authMiddleware,
  requirePermission("org:write"),
  roleController.createRole,
);
router.patch(
  "/organizations/:organization_id/roles/:role_id",
  authMiddleware,
  requirePermission("org:write"),
  roleController.updateRole,
);
router.delete(
  "/organizations/:organization_id/roles/:role_id",
  authMiddleware,
  requirePermission("org:write"),
  roleController.deleteRole,
);

export { router as organizationRoutes };
