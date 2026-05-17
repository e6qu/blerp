import { Request, Response, NextFunction } from "express";
import { MembershipService } from "../services/membership.service";
import { resolvePermissions } from "../../lib/rbac";
import { NotFoundError, UnauthorizedError } from "../../lib/errors";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "../../db/schema";

interface DBUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  [key: string]: unknown;
}

interface DBMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  user?: DBUser;
}

function mapMembership(m: DBMembership, permissions: string[]) {
  return {
    id: m.id,
    organization_id: m.organizationId,
    user_id: m.userId,
    role: m.role,
    // BUG-63 (codex r6): the resolved permission set is the
    // authoritative authorization signal. Previously the SDK derived
    // permissions from `role` via a hard-coded table that disagreed
    // with the API's rbac.ts (admin had org:write in the SDK, but
    // not in rbac.ts), leading to a server-side overgrant in
    // `@blerp/nextjs auth().has(...)` for single-org admins. Now the
    // API returns the canonical permissions list directly so the SDK
    // does no derivation.
    permissions,
    created_at: m.createdAt?.toISOString(),
    updated_at: m.updatedAt?.toISOString(),
    ...(m.user
      ? {
          user: {
            id: m.user.id,
            first_name: m.user.firstName,
            last_name: m.user.lastName,
            image_url: m.user.imageUrl,
          },
        }
      : {}),
  };
}

async function mapMembershipWithPermissions(
  db: BetterSQLite3Database<typeof schema>,
  m: DBMembership,
) {
  const permissions = await resolvePermissions(db, m.organizationId, m.role);
  return mapMembership(m, permissions);
}

export async function createMembership(req: Request, res: Response) {
  const organization_id = req.params.organization_id as string;
  const { user_id, role } = req.body;
  const service = new MembershipService(req.tenantDb!);

  try {
    const membership = await service.create(organization_id, { userId: user_id, role });
    res
      .status(201)
      .json(await mapMembershipWithPermissions(req.tenantDb!, membership as DBMembership));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listMemberships(req: Request, res: Response) {
  const organization_id = req.params.organization_id as string;
  const service = new MembershipService(req.tenantDb!);

  try {
    const memberships = await service.list(organization_id);
    const data = await Promise.all(
      memberships.map((m) => mapMembershipWithPermissions(req.tenantDb!, m as DBMembership)),
    );
    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function updateMembership(req: Request, res: Response) {
  const id = req.params.id as string;
  const { role } = req.body;
  const service = new MembershipService(req.tenantDb!);

  try {
    const membership = await service.update(id, { role });
    res
      .status(200)
      .json(await mapMembershipWithPermissions(req.tenantDb!, membership as DBMembership));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteMembership(req: Request, res: Response) {
  const id = req.params.id as string;
  const service = new MembershipService(req.tenantDb!);

  try {
    await service.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

/*
 * GET /v1/organizations/:organization_id/memberships/me
 *
 * BUG-67 (codex r7): returns the calling user's membership row + the
 * authoritative resolved `permissions` array. Gated by authMiddleware
 * only — every authenticated user can ask about THEIR OWN role +
 * permissions in an org without needing `members:read` (which custom
 * read-only roles may lack). This is what `@blerp/nextjs auth()` calls
 * to populate `orgPermissions` for `has({ permission: ... })` checks.
 */
export async function getOwnMembership(req: Request, res: Response, next: NextFunction) {
  const organization_id = req.params.organization_id as string;
  const userId = req.user?.id;
  if (!userId) {
    return next(new UnauthorizedError());
  }
  const service = new MembershipService(req.tenantDb!);

  try {
    // BUG-71 (codex r9): O(1) point lookup by (org, user). The
    // previous list-and-filter was O(membership-count) and hydrated
    // every member profile on every auth check — a real perf
    // regression on large orgs because @blerp/nextjs auth() hits
    // this endpoint on every server-rendered request.
    const own = await service.getByOrgAndUser(organization_id, userId);
    if (!own) {
      // BUG-73 (codex r10): route through NotFoundError so the
      // central error handler emits the documented dual envelope
      // ({ errors: [{code, message, long_message}], error: {code,
      // message} }) — matches the OpenAPI 404 contract for this
      // endpoint and avoids missing `error.code` on the legacy field.
      return next(new NotFoundError("Membership"));
    }
    res.status(200).json(await mapMembershipWithPermissions(req.tenantDb!, own as DBMembership));
  } catch (error) {
    next(error);
  }
}

export async function leaveOrganization(req: Request, res: Response) {
  const organizationId = req.params.organization_id as string;
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }
  const service = new MembershipService(req.tenantDb!);

  try {
    await service.leaveOrganization(organizationId, userId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
