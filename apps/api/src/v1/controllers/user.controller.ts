import { Request, Response } from "express";
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
    external_id: null,
    username: null,
    primary_email_id: user.primaryEmailAddressId || null,
    status: user.status as "active" | "inactive" | "banned",
    public_metadata: (user.publicMetadata as Record<string, unknown>) || {},
    private_metadata: (user.privateMetadata as Record<string, unknown>) || {},
    unsafe_metadata: (user.unsafeMetadata as Record<string, unknown>) || {},
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
    deleted_at: user.deletedAt?.toISOString() || null,
  };
}

export async function listUsers(req: Request, res: Response) {
  const service = new AuthService(req.tenantDb!, req.tenantId!);
  const { status, metadata_key, metadata_value, limit, cursor } = req.query;

  try {
    const users = await service.listUsers({
      status: status as "active" | "inactive" | "banned",
      metadataKey: metadata_key as string,
      metadataValue: metadata_value as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      cursor: cursor as string,
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
