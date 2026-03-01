import { Request, Response } from "express";
import { EmailService } from "../services/email.service";
import type { components } from "@blerp/shared";
import * as schema from "../../db/schema";

type EmailAddress = components["schemas"]["EmailAddress"];
type DBEmailAddress = typeof schema.emailAddresses.$inferSelect;

function mapEmail(email: DBEmailAddress): EmailAddress {
  return {
    id: email.id,
    email: email.emailAddress,
    verification: {
      status: email.verificationStatus as "verified" | "unverified" | "pending" | "failed",
      strategy: email.verificationStrategy as "email_code" | "email_link" | undefined,
    },
  };
}

function getParam(req: Request, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : val;
}

export async function listEmails(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const service = new EmailService(req.tenantDb!, req.tenantId!);

  try {
    const emails = await service.listEmails(userId);
    res.status(200).json({ data: emails.map(mapEmail) });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function addEmail(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const { email } = req.body;
  const service = new EmailService(req.tenantDb!, req.tenantId!);

  try {
    const newEmail = await service.addEmail(userId, email);
    res.status(201).json(mapEmail(newEmail as DBEmailAddress));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function deleteEmail(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const emailId = getParam(req, "email_address_id");
  const service = new EmailService(req.tenantDb!, req.tenantId!);

  try {
    await service.deleteEmail(userId, emailId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function setPrimaryEmail(req: Request, res: Response) {
  const userId = getParam(req, "user_id");
  const emailId = getParam(req, "email_address_id");
  const service = new EmailService(req.tenantDb!, req.tenantId!);

  try {
    const email = await service.setPrimaryEmail(userId, emailId);
    res.status(200).json(mapEmail(email as DBEmailAddress));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
