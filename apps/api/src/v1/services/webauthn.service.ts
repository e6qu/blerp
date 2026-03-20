import {
  generateRegistrationOptions as generateRegOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TransientStore } from "../../lib/transient-store";

function getRpId(): string {
  if (process.env.WEBAUTHN_RP_ID) return process.env.WEBAUTHN_RP_ID;
  if (process.env.BLERP_API_URL) {
    try {
      return new URL(process.env.BLERP_API_URL).hostname;
    } catch {
      // fall through
    }
  }
  return "localhost";
}

function getRpName(): string {
  return process.env.WEBAUTHN_RP_NAME ?? "Blerp";
}

function getOrigin(): string {
  if (process.env.WEBAUTHN_ORIGIN) return process.env.WEBAUTHN_ORIGIN;
  return process.env.BLERP_API_URL ?? "http://localhost:3000";
}

const challengeStore = new TransientStore<string>(5 * 60 * 1000);

export class WebAuthnService {
  constructor(private db: BetterSQLite3Database<typeof schema>) {}

  async generateRegistrationOptions(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: { emailAddresses: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const userEmail = user.emailAddresses?.[0]?.emailAddress ?? userId;
    const userName = user.username ?? userEmail;

    // Fetch existing passkeys for exclusion
    const existingPasskeys = await this.db
      .select()
      .from(schema.passkeys)
      .where(eq(schema.passkeys.userId, userId));

    const options = await generateRegOptions({
      rpName: getRpName(),
      rpID: getRpId(),
      userName,
      userDisplayName: [user.firstName, user.lastName].filter(Boolean).join(" ") || userName,
      excludeCredentials: existingPasskeys.map((pk) => ({
        id: pk.credentialId,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    challengeStore.set(userId, options.challenge);

    return options;
  }

  async verifyRegistration(userId: string, credential: Record<string, unknown>) {
    const expectedChallenge = challengeStore.get(userId);
    if (!expectedChallenge) {
      throw new Error("Registration challenge expired or not found");
    }

    type RegResponse = Parameters<typeof verifyRegistrationResponse>[0]["response"];
    const verification = await verifyRegistrationResponse({
      response: credential as unknown as RegResponse,
      expectedChallenge,
      expectedOrigin: getOrigin(),
      expectedRPID: getRpId(),
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error("Registration verification failed");
    }

    const {
      credential: cred,
      credentialDeviceType,
      credentialBackedUp,
    } = verification.registrationInfo;

    const id = `pk_${nanoid()}`;
    await this.db.insert(schema.passkeys).values({
      id,
      userId,
      name: "My Passkey",
      publicKey: Buffer.from(cred.publicKey).toString("base64url"),
      credentialId: cred.id,
      counter: cred.counter,
    });

    challengeStore.delete(userId);

    return {
      success: true,
      device_type: credentialDeviceType,
      backed_up: credentialBackedUp,
    };
  }

  async listPasskeys(userId: string) {
    return this.db.select().from(schema.passkeys).where(eq(schema.passkeys.userId, userId));
  }

  async renamePasskey(userId: string, id: string, name: string) {
    const passkey = await this.db.query.passkeys.findFirst({
      where: eq(schema.passkeys.id, id),
    });
    if (!passkey || passkey.userId !== userId) {
      throw new Error("Passkey not found");
    }
    await this.db.update(schema.passkeys).set({ name }).where(eq(schema.passkeys.id, id));
    return this.db.query.passkeys.findFirst({
      where: eq(schema.passkeys.id, id),
    });
  }

  async deletePasskey(_userId: string, id: string) {
    await this.db.delete(schema.passkeys).where(eq(schema.passkeys.id, id));
  }
}
