import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { validateMetadata, Metadata } from "../../lib/metadata";
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
    username: undefined,
    primary_email_id: user.primaryEmailAddressId || undefined,
    status: user.status as "active" | "inactive" | "banned",
    public_metadata: (user.publicMetadata as Metadata) || {},
    private_metadata: (user.privateMetadata as Metadata) || {},
    unsafe_metadata: (user.unsafeMetadata as Metadata) || {},
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

export async function updateMetadata(req: Request, res: Response) {
  const id = req.params.user_id as string;
  const { public_metadata, private_metadata, unsafe_metadata } = req.body;
  const service = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    // Validate mapping structures
    if (public_metadata) validateMetadata(public_metadata as Metadata);
    if (private_metadata) validateMetadata(private_metadata as Metadata);
    if (unsafe_metadata) validateMetadata(unsafe_metadata as Metadata);

    const user = await service.updateUserMetadata(id, {
      publicMetadata: public_metadata as Metadata,
      privateMetadata: private_metadata as Metadata,
      unsafeMetadata: unsafe_metadata as Metadata,
    });
    if (!user) throw new Error("User not found");

    res.status(200).json(mapUser(user as unknown as UserWithRelations));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
