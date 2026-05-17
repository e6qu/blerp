import {
  generateRegistrationOptions as generateRegOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TransientStore } from "../../lib/transient-store";

// BUG-65 (codex r7): this service is loaded eagerly by auth.routes
// (auth.routes → webauthn.controller → webauthn.service) during API
// boot. Importing `@blerp/shared`'s value exports here resolves through
// the gitignored `packages/shared/dist/index.js`, so `cd apps/api &&
// bun run dev` on a fresh checkout (Playwright's webServer pattern)
// fails to start before /health is available. Inline the env reads
// here — same dual-name semantics (BLERP_* > CLERK_* > default) as the
// shared helper. Trade-off: a tiny duplication at module load time.
function readApiUrl(): string {
  // BUG-74 (codex r11): strip a trailing `/v1` so Clerk-style URLs
  // (`https://api.example.com/v1`) don't compound into `/v1/v1/...`.
  // BUG-79/80 (codex r15): coerce blank-string vars to undefined so
  // an empty BLERP_API_URL doesn't short-circuit the CLERK fallback;
  // strip a trailing slash to avoid `//v1/...` on bare-host URLs.
  const nonBlank = (v: string | undefined) => (v && v.trim() !== "" ? v : undefined);
  return (
    nonBlank(process.env.BLERP_API_URL) ??
    nonBlank(process.env.CLERK_API_URL) ??
    "http://localhost:3000"
  )
    .replace(/\/v1\/?$/i, "")
    .replace(/\/+$/, "");
}

function getRpId(): string {
  if (process.env.WEBAUTHN_RP_ID) return process.env.WEBAUTHN_RP_ID;
  try {
    return new URL(readApiUrl()).hostname;
  } catch {
    return "localhost";
  }
}

function getRpName(): string {
  return process.env.WEBAUTHN_RP_NAME ?? "Blerp";
}

function getOrigin(): string {
  return process.env.WEBAUTHN_ORIGIN ?? readApiUrl();
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

  async verifyRegistration(
    userId: string,
    credential: Record<string, unknown>,
    friendlyName?: string,
  ) {
    const expectedChallenge = challengeStore.get(userId);
    if (!expectedChallenge) {
      throw new Error("Registration challenge expired or not found");
    }

    type RegResponse = Parameters<typeof verifyRegistrationResponse>[0]["response"];
    // Bridge the wire JSON shape to @simplewebauthn's typed input.
    // The library performs full structural validation on this argument, so the
    // cast is a load-bearing boundary marker, not a type-checking shortcut.
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
      name: friendlyName?.trim() || "My Passkey",
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

  async deletePasskey(userId: string, id: string) {
    const passkey = await this.db.query.passkeys.findFirst({
      where: eq(schema.passkeys.id, id),
    });
    if (!passkey || passkey.userId !== userId) {
      throw new Error("Passkey not found");
    }
    await this.db.delete(schema.passkeys).where(eq(schema.passkeys.id, id));
  }
}
