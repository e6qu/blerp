import { generateSecret, TOTP, generateURI } from "otplib";
import { nanoid } from "nanoid";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";

const ISSUER = "Blerp";
const totp = new TOTP();

export class TotpService {
  constructor(
    private db: BetterSQLite3Database<typeof schema>,
    private tenantId: string,
  ) {}

  async enroll(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: {
        emailAddresses: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.totpEnabled) {
      throw new Error("TOTP already enabled");
    }

    const secret = generateSecret();
    const accountName = user.emailAddresses?.[0]?.emailAddress || userId;
    const uri = generateURI({
      issuer: ISSUER,
      label: accountName,
      secret: secret,
    });

    await this.db
      .update(schema.users)
      .set({
        totpSecret: secret,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    return {
      secret,
      uri,
      qr_code_url: `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(uri)}&choe=UTF-8`,
    };
  }

  async verify(userId: string, code: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.totpSecret) {
      throw new Error("TOTP not enrolled");
    }

    if (user.totpEnabled) {
      throw new Error("TOTP already verified");
    }

    const isValid = totp.verify(code, { secret: user.totpSecret });

    if (!isValid) {
      throw new Error("Invalid verification code");
    }

    const backupCodes = this.generateBackupCodes();

    await this.db
      .update(schema.users)
      .set({
        totpEnabled: true,
        backupCodes: backupCodes,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    return { verified: true, backup_codes: backupCodes };
  }

  async regenerateBackupCodes(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.totpEnabled) {
      throw new Error("TOTP not enabled");
    }

    const backupCodes = this.generateBackupCodes();

    await this.db
      .update(schema.users)
      .set({
        backupCodes: backupCodes,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    return { codes: backupCodes };
  }

  async disable(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    await this.db
      .update(schema.users)
      .set({
        totpSecret: null,
        totpEnabled: false,
        backupCodes: [],
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    return { disabled: true };
  }

  private generateBackupCodes(count = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(nanoid(8).toUpperCase());
    }
    return codes;
  }
}
