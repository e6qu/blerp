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
router.post(
  "/organizations",
  authMiddleware,
  requireProjectAccess((req) =>
    typeof req.body?.project_id === "string" ? req.body.project_id : undefined,
  ),
  organizationController.createOrganization,
);
router.get(
  "/organizations",
  // BUG-167 (codex r43): domain-discovery (?domain=) is a pre-session
  // lookup (the OAuth sign-in flow uses it to resolve "which org owns
  // this email domain" before the user is authenticated). For that
  // narrow path, skip auth entirely. For everything else, require
  // session/M2M + project access so tenant-wide enumeration is
  // impossible.
  (req, res, next) => {
    if (typeof req.query?.domain === "string") return next();
    return authMiddleware(req, res, () =>
      requireProjectAccess((r) =>
        typeof r.query?.project_id === "string" ? r.query.project_id : undefined,
      )(req, res, next),
    );
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
