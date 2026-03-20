import { nanoid } from "nanoid";
import { TOTP } from "otplib";
import { eventBus } from "../../lib/events";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema";
import { eq, and, sql, desc, asc, like } from "drizzle-orm";
import { deepMerge, Metadata } from "../../lib/metadata";
import { crypto } from "../../lib/crypto";
import { otp } from "../../lib/otp";
import { logger } from "../../lib/logger";
import { TransientStore } from "../../lib/transient-store";
import { RestrictionService } from "./restriction.service";
import { getKeyPair } from "../../lib/keys";
import { jwt } from "../../lib/jwt";

interface PendingSignin {
  userId: string;
  identifier: string;
  ipAddress?: string;
  userAgent?: string;
}

interface PendingSignup {
  code: string;
  email: string;
  strategy: string;
}

const pendingSignins = new TransientStore<PendingSignin>(5 * 60 * 1000);
const pendingSignups = new TransientStore<PendingSignup>(15 * 60 * 1000);

export class AuthService {
  constructor(
    private db: BetterSQLite3Database<typeof schema>,
    private tenantId: string,
  ) {}

  async createSignup(data: { email: string; strategy: string }) {
    const signupId = `sig_${nanoid()}`;
    const code = otp.generateNumericCode(6);

    pendingSignups.set(signupId, {
      code,
      email: data.email,
      strategy: data.strategy,
    });

    logger.info({ email: data.email, code }, "Signup verification code");

    const response: Record<string, unknown> = {
      id: signupId,
      status: "needs_verification",
      identifier: data.email,
      strategy: data.strategy,
      verification: {
        channel: "email_code",
        expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
      },
    };

    if (process.env.NODE_ENV !== "production") {
      response.verification_code = code;
    }

    return response;
  }

  async attemptSignup(signupId: string, code: string, _email: string = "pending@example.com") {
    const pending = pendingSignups.get(signupId);
    if (!pending) {
      throw new Error("Signup attempt expired or not found");
    }

    if (code !== pending.code) {
      throw new Error("Invalid verification code");
    }

    const email = pending.email;
    pendingSignups.delete(signupId);

    // Check signup restrictions
    const restrictionService = new RestrictionService(this.db);
    const check = await restrictionService.checkSignup(email);
    if (!check.allowed) {
      throw new Error(check.reason ?? "Signup not allowed");
    }

    const userId = `user_${nanoid()}`;
    await this.db.insert(schema.users).values({
      id: userId,
      status: "active",
    });
    await this.db.insert(schema.emailAddresses).values({
      id: `email_${nanoid()}`,
      userId,
      emailAddress: email,
      verificationStatus: "verified",
    });

    // Domain Auto-enrollment
    const domain = email.split("@")[1];
    if (domain) {
      const verifiedDomain = await this.db.query.organizationDomains.findFirst({
        where: and(
          eq(schema.organizationDomains.domain, domain),
          eq(schema.organizationDomains.verificationStatus, "verified"),
        ),
      });

      if (verifiedDomain) {
        await this.db.insert(schema.memberships).values({
          id: `mem_${nanoid()}`,
          organizationId: verifiedDomain.organizationId,
          userId,
          role: "member",
        });
      }
    }

    await eventBus.emit("user.created", this.tenantId, { userId });
    return { userId };
  }

  async getUser(id: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        emailAddresses: true,
      },
    });
  }

  async updateUser(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      username?: string;
      password?: string;
      status?: "active" | "inactive" | "banned";
    },
  ) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updateData: Partial<typeof schema.users.$inferInsert> = { updatedAt: new Date() };

    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName;
    }
    if (data.username !== undefined) {
      const existing = await this.db.query.users.findFirst({
        where: and(eq(schema.users.username, data.username), sql`${schema.users.id} != ${userId}`),
      });
      if (existing) throw new Error("Username already taken");
      updateData.username = data.username;
    }
    if (data.password !== undefined) {
      updateData.passwordDigest = await crypto.hashPassword(data.password);
      updateData.hasPassword = true;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    await this.db.update(schema.users).set(updateData).where(eq(schema.users.id, userId));

    return this.getUser(userId);
  }

  async updateUserMetadata(
    userId: string,
    data: { publicMetadata?: Metadata; privateMetadata?: Metadata; unsafeMetadata?: Metadata },
  ) {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const updateData: Partial<typeof schema.users.$inferInsert> = { updatedAt: new Date() };

    if (data.publicMetadata) {
      updateData.publicMetadata = deepMerge(
        (user.publicMetadata as Metadata) || {},
        data.publicMetadata,
      );
    }
    if (data.privateMetadata) {
      updateData.privateMetadata = deepMerge(
        (user.privateMetadata as Metadata) || {},
        data.privateMetadata,
      );
    }
    if (data.unsafeMetadata) {
      updateData.unsafeMetadata = deepMerge(
        (user.unsafeMetadata as Metadata) || {},
        data.unsafeMetadata,
      );
    }

    await this.db.update(schema.users).set(updateData).where(eq(schema.users.id, userId));

    return this.getUser(userId);
  }

  async createSignin(data: { identifier: string; strategy: string }) {
    // Look up user by email
    const emailRecord = await this.db.query.emailAddresses.findFirst({
      where: eq(schema.emailAddresses.emailAddress, data.identifier),
    });

    if (!emailRecord) {
      throw new Error("No account found with that email address");
    }

    const user = await this.getUser(emailRecord.userId);
    if (!user) {
      throw new Error("No account found with that email address");
    }

    if (user.status !== "active") {
      throw new Error("Account is not active");
    }

    const signinId = `sin_${nanoid()}`;
    const mfaRequired = user.totpEnabled ?? false;

    return {
      id: signinId,
      identifier: data.identifier,
      status: "needs_first_factor" as const,
      strategy: data.strategy,
      mfa_required: mfaRequired,
      available_strategies: [data.strategy],
    };
  }

  async attemptSignin(
    signinId: string,
    identifier: string,
    password: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Look up user by email
    const emailRecord = await this.db.query.emailAddresses.findFirst({
      where: eq(schema.emailAddresses.emailAddress, identifier),
    });

    if (!emailRecord) {
      throw new Error("Invalid email or password");
    }

    const user = await this.getUser(emailRecord.userId);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.passwordDigest) {
      throw new Error("No password set for this account");
    }

    const valid = await crypto.verifyPassword(user.passwordDigest, password);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    // If TOTP is enabled, defer session creation until 2FA is verified
    if (user.totpEnabled) {
      pendingSignins.set(signinId, {
        userId: user.id,
        identifier,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      });
      return {
        status: "needs_second_factor" as const,
        signin_id: signinId,
      };
    }

    return this.createSessionForUser(user.id, metadata);
  }

  async attemptSecondFactor(
    signinId: string,
    code: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    const pending = pendingSignins.get(signinId);
    if (!pending) {
      throw new Error("Sign-in attempt expired or not found");
    }

    const user = await this.getUser(pending.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Try TOTP verification
    let verified = false;
    if (user.totpSecret) {
      const totp = new TOTP();
      const result = await totp.verify(code, { secret: user.totpSecret });
      verified = result.valid;
    }

    // Try backup codes if TOTP didn't match
    if (!verified) {
      const backupCodes = (user.backupCodes ?? []) as string[];
      const codeIndex = backupCodes.indexOf(code);
      if (codeIndex >= 0) {
        verified = true;
        const updatedCodes = [...backupCodes];
        updatedCodes.splice(codeIndex, 1);
        await this.db
          .update(schema.users)
          .set({ backupCodes: updatedCodes, updatedAt: new Date() })
          .where(eq(schema.users.id, user.id));
      }
    }

    if (!verified) {
      throw new Error("Invalid verification code");
    }

    pendingSignins.delete(signinId);

    const mergedMetadata = {
      ipAddress: metadata?.ipAddress ?? pending.ipAddress,
      userAgent: metadata?.userAgent ?? pending.userAgent,
    };

    return this.createSessionForUser(user.id, mergedMetadata);
  }

  private async createSessionForUser(
    userId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    const sessionId = `ses_${nanoid()}`;
    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const abandonAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.db.insert(schema.sessions).values({
      id: sessionId,
      userId,
      status: "active",
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      expireAt,
      abandonAt,
    });

    // Update last sign in
    await this.db
      .update(schema.users)
      .set({ lastSignInAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.users.id, userId));

    const { privateKey } = await getKeyPair();
    const accessToken = await jwt.sign({ sub: userId, sid: sessionId }, privateKey, {
      issuer: "blerp",
      audience: "blerp-api",
      expiresIn: "7d",
    });

    return {
      session: {
        id: sessionId,
        user_id: userId,
        status: "active" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      tokens: {
        access_token: accessToken,
        refresh_token: `ref_${nanoid()}`,
        expires_in: 604800,
        session_id: sessionId,
      },
    };
  }

  async listUsers(filters: {
    email?: string;
    status?: "active" | "inactive" | "banned";
    metadataKey?: string;
    metadataValue?: string;
    query?: string;
    orderBy?: string;
    limit?: number;
    cursor?: string;
    includeDeleted?: boolean;
  }) {
    const {
      status,
      metadataKey,
      metadataValue,
      query: searchQuery,
      orderBy: orderByParam,
      limit = 20,
      includeDeleted,
    } = filters;

    const whereClauses = [];

    if (!includeDeleted) {
      whereClauses.push(sql`${schema.users.deletedAt} IS NULL`);
    }

    if (status) {
      whereClauses.push(eq(schema.users.status, status));
    }

    if (metadataKey && metadataValue) {
      // Convert JSON pointer or dot notation to SQLite path
      let path = metadataKey;
      if (path.startsWith("/")) path = path.substring(1);
      path = path.replace(/\//g, ".");
      if (!path.startsWith("$.")) path = "$." + path;

      whereClauses.push(
        sql`(json_extract(${schema.users.publicMetadata}, ${path}) = ${metadataValue} OR
             json_extract(${schema.users.privateMetadata}, ${path}) = ${metadataValue})`,
      );
    }

    if (searchQuery) {
      const pattern = `%${searchQuery}%`;
      whereClauses.push(
        sql`(${like(schema.users.firstName, pattern)} OR ${like(schema.users.lastName, pattern)} OR ${like(schema.users.username, pattern)} OR ${schema.users.id} IN (SELECT ${schema.emailAddresses.userId} FROM ${schema.emailAddresses} WHERE ${like(schema.emailAddresses.emailAddress, pattern)}))`,
      );
    }

    // Parse orderBy: "-created_at" → desc, "created_at" → asc
    const resolveOrderBy = (param?: string) => {
      if (!param) return [desc(schema.users.createdAt)];

      const isDescending = param.startsWith("-");
      const columnName = isDescending ? param.slice(1) : param;
      const dirFn = isDescending ? desc : asc;

      switch (columnName) {
        case "created_at":
          return [dirFn(schema.users.createdAt)];
        case "updated_at":
          return [dirFn(schema.users.updatedAt)];
        case "last_sign_in_at":
          return [dirFn(schema.users.lastSignInAt)];
        case "first_name":
          return [dirFn(schema.users.firstName)];
        case "last_name":
          return [dirFn(schema.users.lastName)];
        case "username":
          return [dirFn(schema.users.username)];
        default:
          return [desc(schema.users.createdAt)];
      }
    };

    return this.db.query.users.findMany({
      where: whereClauses.length > 0 ? and(...whereClauses) : undefined,
      limit,
      orderBy: resolveOrderBy(orderByParam),
      with: {
        emailAddresses: true,
      },
    });
  }
}
