/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { validateMetadata, Metadata } from "../../lib/metadata";
import type { components } from "@blerp/shared";

type User = components["schemas"]["User"];

function mapUser(user: any): User {
  return {
    id: user.id,
    external_id: user.externalId || null,
    username: user.username || null,
    primary_email_id: user.primaryEmailAddressId || null,
    status: user.status as "active" | "inactive" | "banned",
    public_metadata: (user.publicMetadata as Record<string, unknown>) || {},
    private_metadata: (user.privateMetadata as Record<string, unknown>) || {},
    unsafe_metadata: (user.unsafeMetadata as Record<string, unknown>) || {},
    email_addresses: (user.emailAddresses || []).map((e: any) => ({
      id: e.id,
      email: e.emailAddress,
      verification: {
        status: e.verificationStatus as "verified" | "unverified",
        strategy: e.verificationStrategy || undefined,
      },
      created_at: e.createdAt.toISOString(),
      updated_at: e.updatedAt.toISOString(),
    })),
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt?.toISOString() || user.createdAt.toISOString(),
    deleted_at: user.deletedAt?.toISOString() || null,
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

    res.status(200).json(mapUser(user));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
