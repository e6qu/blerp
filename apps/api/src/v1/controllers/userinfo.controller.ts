import { Request, Response } from "express";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";

export async function getUserInfo(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const db = req.tenantDb!;
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    with: {
      emailAddresses: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    sub: user.id,
    name: `${user.firstName} ${user.lastName}`,
    given_name: user.firstName,
    family_name: user.lastName,
    email: user.emailAddresses[0]?.emailAddress,
    email_verified: user.emailAddresses[0]?.verificationStatus === "verified",
  });
}
