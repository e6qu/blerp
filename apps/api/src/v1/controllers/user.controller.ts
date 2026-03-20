import { Request, Response } from "express";
import { eq, inArray } from "drizzle-orm";
import { AuthService } from "../services/auth.service";
import type { components } from "@blerp/shared";
import * as schema from "../../db/schema";

type User = components["schemas"]["User"];
type DBUser = typeof schema.users.$inferSelect;
type DBEmailAddress = typeof schema.emailAddresses.$inferSelect;

interface UserWithRelations extends DBUser {
  emailAddresses: DBEmailAddress[];
}

function mapUser(user: UserWithRelations): User {
  return {
    id: user.id,
    external_id: undefined,
    username: user.username ?? undefined,
    first_name: user.firstName ?? undefined,
    last_name: user.lastName ?? undefined,
    image_url: user.imageUrl ?? undefined,
    primary_email_id: user.primaryEmailAddressId ?? undefined,
    status: user.status as "active" | "inactive" | "banned",
    public_metadata: (user.publicMetadata as Record<string, unknown>) || {},
    private_metadata: (user.privateMetadata as Record<string, unknown>) || {},
    unsafe_metadata: (user.unsafeMetadata as Record<string, unknown>) || {},
    totp_enabled: user.totpEnabled,
    email_addresses: (user.emailAddresses || []).map((e: DBEmailAddress) => ({
      id: e.id,
      email: e.emailAddress,
      verification: {
        status: e.verificationStatus as "verified" | "unverified",
        strategy: e.verificationStrategy as "email_code" | "email_link" | undefined,
      },
    })),
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt?.toISOString() || user.createdAt.toISOString(),
    deleted_at: user.deletedAt?.toISOString() || undefined,
  };
}

export async function listUsers(req: Request, res: Response) {
  const service = new AuthService(req.tenantDb!, req.tenantId!);
  const { status, metadata_key, metadata_value, limit, cursor, query, order_by, include_deleted } =
    req.query;

  try {
    const users = await service.listUsers({
      status: status as "active" | "inactive" | "banned",
      metadataKey: metadata_key as string,
      metadataValue: metadata_value as string,
      query: query as string,
      orderBy: order_by as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      cursor: cursor as string,
      includeDeleted: include_deleted === "true",
    });
    const mappedUsers = (users as unknown as UserWithRelations[]).map((u) => mapUser(u));
    res.status(200).json({ data: mappedUsers });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function getUser(req: Request, res: Response) {
  const id = (req.params.user_id || req.params.id) as string;
  const service = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    const user = await service.getUser(id);
    if (!user) {
      res.status(404).json({ error: { message: "User not found" } });
      return;
    }
    res.status(200).json(mapUser(user as unknown as UserWithRelations));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function updateUser(req: Request, res: Response) {
  const id = (req.params.user_id || req.params.id) as string;
  const service = new AuthService(req.tenantDb!, req.tenantId!);
  const { first_name, last_name, username, password, status } = req.body;

  try {
    const user = await service.updateUser(id, {
      firstName: first_name,
      lastName: last_name,
      username,
      password,
      status,
    });
    res.status(200).json(mapUser(user as unknown as UserWithRelations));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const id = (req.params.user_id || req.params.id) as string;
  const service = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    const user = await service.getUser(id);
    if (!user) {
      res.status(404).json({ error: { message: "User not found" } });
      return;
    }
    await req
      .tenantDb!.update(schema.users)
      .set({ deletedAt: new Date() })
      .where(eq(schema.users.id, id));
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function restoreUser(req: Request, res: Response) {
  const id = (req.params.user_id || req.params.id) as string;
  const service = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    const user = await service.getUser(id);
    if (!user) {
      res.status(404).json({ error: { message: "User not found" } });
      return;
    }
    if (!user.deletedAt) {
      res.status(400).json({ error: { message: "User is not deleted" } });
      return;
    }
    await req
      .tenantDb!.update(schema.users)
      .set({ deletedAt: null, status: "active", updatedAt: new Date() })
      .where(eq(schema.users.id, id));
    const restored = await service.getUser(id);
    res.status(200).json(mapUser(restored as unknown as UserWithRelations));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function bulkUpdateUsers(req: Request, res: Response) {
  const { user_ids, action } = req.body as {
    user_ids?: string[];
    action?: "delete" | "ban" | "activate";
  };

  if (!user_ids?.length) {
    res.status(400).json({ error: { message: "user_ids array is required" } });
    return;
  }
  if (!action || !["delete", "ban", "activate"].includes(action)) {
    res.status(400).json({ error: { message: "action must be one of: delete, ban, activate" } });
    return;
  }

  const now = new Date();

  try {
    switch (action) {
      case "delete":
        await req
          .tenantDb!.update(schema.users)
          .set({ deletedAt: now, updatedAt: now })
          .where(inArray(schema.users.id, user_ids));
        break;
      case "ban":
        await req
          .tenantDb!.update(schema.users)
          .set({ status: "banned", updatedAt: now })
          .where(inArray(schema.users.id, user_ids));
        break;
      case "activate":
        await req
          .tenantDb!.update(schema.users)
          .set({ status: "active", deletedAt: null, updatedAt: now })
          .where(inArray(schema.users.id, user_ids));
        break;
    }

    res.status(200).json({ success: true, affected: user_ids.length, action });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
