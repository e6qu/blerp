import { Request, Response } from "express";
import { OrganizationService } from "../services/organization.service";
import { cache } from "../../lib/redis";
import type { components } from "@blerp/shared";
import { Metadata } from "../../lib/metadata";
import { NotFoundError, BadRequestError } from "../../lib/errors";

type Organization = components["schemas"]["Organization"];

interface DBOrg {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  publicMetadata: string | Metadata | unknown;
  privateMetadata: string | Metadata | unknown;
  createdAt: Date;
  updatedAt: Date;
}

function mapOrganization(org: DBOrg): Organization {
  return {
    id: org.id,
    project_id: org.projectId,
    name: org.name,
    slug: org.slug,
    public_metadata: org.publicMetadata as Organization["public_metadata"],
    private_metadata: org.privateMetadata as Organization["private_metadata"],
    created_at: org.createdAt.toISOString(),
  };
}

// BUG-173 (codex r45) / BUG-174 (codex r46): the org list is no
// longer cached (the speedup didn't justify the resurrection race —
// see listOrganizations for the rationale). Bust any legacy keys so
// a deploy that still has a populated cache from the prior version
// doesn't serve stale data after a mutation. Safe to delete this
// helper after one release cycle.
async function bustOrgListCache(tenantId: string, projectId?: string) {
  await cache.del(`blerp:orgs:${tenantId}`);
  await cache.del(`blerp:orgs:${tenantId}:_`);
  if (projectId) {
    await cache.del(`blerp:orgs:${tenantId}:${projectId}`);
  }
}

export async function createOrganization(req: Request, res: Response) {
  const { name, slug, project_id } = req.body as {
    name: string;
    slug?: string;
    project_id: string;
  };
  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  const org = await service.create({ name, slug, projectId: project_id });
  if (!org) {
    throw new BadRequestError("Failed to create organization");
  }

  await bustOrgListCache(req.tenantId!, project_id);
  res.status(201).json(mapOrganization(org));
}

export async function listOrganizations(req: Request, res: Response) {
  const { domain, limit, offset, query, project_id } = req.query as {
    domain?: string;
    limit?: string;
    offset?: string;
    query?: string;
    project_id?: string;
  };
  // BUG-170 (codex r44): the project_id from query is the scope. The
  // requireProjectAccess gate already validated the caller has access
  // to it (BUG-167); now the service actually filters by it.
  // Domain-discovery (?domain=) bypasses the project filter — it's
  // already filtered to verified-domain orgs and is pre-session.
  //
  // BUG-174 (codex r46): no read-through cache here. A previous
  // implementation cached the list under a per-(tenant, project) key
  // with a 300s TTL. That created a classic cache-resurrection race:
  //   T1 (list, cache miss) reads DB → [orgA, orgB]
  //   T2 (delete orgA) busts cache
  //   T1 cache.set([orgA, orgB])  ← resurrects deleted org for 300s
  // including stale `private_metadata`. The org list is small and
  // database-backed; the speedup didn't justify the data-freshness
  // hazard. If caching becomes necessary later, use a versioned key
  // (per-tenant counter that mutations increment).
  const projectId = typeof project_id === "string" ? project_id : undefined;

  // BUG-178 (codex r48): when no explicit `project_id` is supplied,
  // derive the scope from the auth context. Mirrors Clerk's session
  // semantics: `clerkClient.organizations.list()` returns orgs the
  // caller can actually see.
  //   * Real M2M token with a project scope → restrict to that project.
  //   * Session JWT (or X-User-Id dev shim) → restrict to orgs the
  //     user is a member of, or projects the user owns.
  //   * Tenant-root M2M (only mintable via the chain-of-trust gate, see
  //     `createM2MToken`) → no filter; returns every org in the tenant.
  // The route only attaches `requireProjectAccess` when `project_id`
  // is explicit, so the auth-context scope below is the sole defence
  // against tenant-wide enumeration for the "no project_id" path.
  let derivedProjectId: string | undefined;
  let accessibleToUserId: string | undefined;
  if (!projectId && !domain) {
    const isDevShimM2M = req.m2m?.clientId.startsWith("dev-shim") ?? false;
    if (req.m2m && !isDevShimM2M && req.m2m.projectId) {
      derivedProjectId = req.m2m.projectId;
    } else if (req.user) {
      accessibleToUserId = req.user.id;
    }
  }

  const parsedLimit = limit ? parseInt(limit, 10) : undefined;
  const parsedOffset = offset ? parseInt(offset, 10) : undefined;

  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  const result = await service.list({
    domain,
    query,
    projectId: projectId ?? derivedProjectId,
    accessibleToUserId,
    limit: parsedLimit,
    offset: parsedOffset,
  });
  // BUG-172 (codex r44): the domain-discovery path is unauthenticated
  // (intentional — pre-session OAuth sign-in flow). Strip private
  // metadata from the response so an unauthenticated caller can
  // resolve "which org owns this domain" without exfiltrating org
  // private config. Other callers (authenticated, project-scoped) get
  // the full org shape.
  const isUnauthenticatedDiscovery = !!domain && !req.user && !req.m2m;
  const mappedOrgs = result.data.map((o) => {
    const full = mapOrganization(o);
    if (isUnauthenticatedDiscovery) {
      return { ...full, private_metadata: undefined } as typeof full;
    }
    return full;
  });
  // BUG-48: Clerk's paginated list shape is { data, total_count }.
  // BUG-174 (codex r46): no `cache.set` — see comment at top of function.
  const response = {
    data: mappedOrgs,
    total_count: result.totalCount,
    meta: { total: result.totalCount },
  };
  res.status(200).json(response);
}

export async function getOrganization(req: Request, res: Response) {
  const id = (req.params.organization_id || req.params.id) as string;
  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  const org = await service.get(id);
  if (!org) {
    throw new NotFoundError("Organization");
  }
  res.status(200).json(mapOrganization(org));
}

export async function updateOrganization(req: Request, res: Response) {
  const id = (req.params.organization_id || req.params.id) as string;
  const data = req.body as {
    name?: string;
    slug?: string;
    public_metadata?: Metadata;
    private_metadata?: Metadata;
  };
  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  const org = await service.update(id, {
    name: data.name,
    slug: data.slug,
    publicMetadata: data.public_metadata,
    privateMetadata: data.private_metadata,
  });
  if (!org) {
    throw new BadRequestError("Failed to update organization");
  }

  await bustOrgListCache(req.tenantId!, org.projectId);
  res.status(200).json(mapOrganization(org));
}

export async function deleteOrganization(req: Request, res: Response) {
  const id = (req.params.organization_id || req.params.id) as string;
  const service = new OrganizationService(req.tenantDb!, req.tenantId!);

  // Note: the route is gated by requirePermission("org:write"), which
  // requires a membership row pointing at this organization. That check
  // fires before the controller, so a missing org never reaches this
  // function — the user gets 403 instead. The OpenAPI contract therefore
  // documents 403 (not 404) for the missing/not-permitted case.
  //
  // BUG-173 (codex r45): look up the org BEFORE deleting so we know the
  // project_id to bust. Cache bust after delete; missing org → no
  // project-key bust (fallback to the tenant-wide ones).
  const orgBeforeDelete = await service.get(id);
  await service.delete(id);
  await bustOrgListCache(req.tenantId!, orgBeforeDelete?.projectId);
  res.status(204).send();
}
