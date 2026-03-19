import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import * as schema from "../../db/schema";

function getParam(req: Request, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

export async function listPhoneNumbers(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const db = req.tenantDb!;

  try {
    const phones = await db.query.phoneNumbers.findMany({
      where: eq(schema.phoneNumbers.userId, userId),
    });
    res.status(200).json({
      data: phones.map((p) => ({
        id: p.id,
        phone_number: p.phoneNumber,
        verification_status: p.verificationStatus,
        created_at: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function addPhoneNumber(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const { phone_number } = req.body;
  const db = req.tenantDb!;

  if (!phone_number) {
    res.status(400).json({ error: { message: "phone_number is required" } });
    return;
  }

  try {
    const existing = await db.query.phoneNumbers.findFirst({
      where: eq(schema.phoneNumbers.phoneNumber, phone_number),
    });
    if (existing) {
      res.status(400).json({ error: { message: "Phone number already in use" } });
      return;
    }

    const id = `phone_${nanoid()}`;
    await db.insert(schema.phoneNumbers).values({
      id,
      userId,
      phoneNumber: phone_number,
      verificationStatus: "unverified",
    });

    const phone = await db.query.phoneNumbers.findFirst({
      where: eq(schema.phoneNumbers.id, id),
    });

    res.status(201).json({
      id: phone!.id,
      phone_number: phone!.phoneNumber,
      verification_status: phone!.verificationStatus,
      created_at: phone!.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deletePhoneNumber(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const phoneNumberId = getParam(req, "phone_number_id");
  const db = req.tenantDb!;

  try {
    const phone = await db.query.phoneNumbers.findFirst({
      where: and(eq(schema.phoneNumbers.id, phoneNumberId), eq(schema.phoneNumbers.userId, userId)),
    });
    if (!phone) {
      res.status(404).json({ error: { message: "Phone number not found" } });
      return;
    }

    await db.delete(schema.phoneNumbers).where(eq(schema.phoneNumbers.id, phoneNumberId));
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function setPrimaryPhone(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const phoneNumberId = getParam(req, "phone_number_id");
  const db = req.tenantDb!;

  try {
    const phone = await db.query.phoneNumbers.findFirst({
      where: and(eq(schema.phoneNumbers.id, phoneNumberId), eq(schema.phoneNumbers.userId, userId)),
    });
    if (!phone) {
      res.status(404).json({ error: { message: "Phone number not found" } });
      return;
    }

    if (phone.verificationStatus !== "verified") {
      res
        .status(400)
        .json({ error: { message: "Phone number must be verified before setting as primary" } });
      return;
    }

    await db.update(schema.users).set({ updatedAt: new Date() }).where(eq(schema.users.id, userId));

    res.status(200).json({
      id: phone.id,
      phone_number: phone.phoneNumber,
      verification_status: phone.verificationStatus,
      created_at: phone.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
