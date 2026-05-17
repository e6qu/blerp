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
import { resolvePermissions } from "../../lib/rbac";

// BUG-132 (codex r26): track sign-in attempts in two phases so the
// `signin_id` is enforced end-to-end. Without this, a caller could
// skip the createSignin step and POST credentials straight to
// `/v1/auth/signins/sin_fake/attempt` — the service used to accept any
// path-id for non-MFA users. Now the first-factor branch validates the
// id exists + matches the supplied identifier + hasn't expired. The
// elevated `PendingSecondFactor` keeps the same shape as before so the
// MFA flow is unchanged.
interface PendingFirstFactor {
  stage: "first_factor";
  identifier: string;
  strategy: string;
  createdAt: number;
}
interface PendingSecondFactor {
  stage: "second_factor";
  userId: string;
  identifier: string;
  ipAddress?: string;
  userAgent?: string;
}
type PendingSignin = PendingFirstFactor | PendingSecondFactor;

interface PendingSignup {
  code: string;
  email: string;
  strategy: string;
  // BUG-114 (codex r20): optional password hash. Stored at createSignup
  // time so attemptSignup can install it on the new user without a
  // second round-trip. OpenAPI documents `password` on the create
  // endpoint already; only the runtime was ignoring it.
  passwordDigest?: string;
}

const pendingSignins = new TransientStore<PendingSignin>(5 * 60 * 1000);
const pendingSignups = new TransientStore<PendingSignup>(15 * 60 * 1000);

export class AuthService {
  constructor(
    private db: BetterSQLite3Database<typeof schema>,
    private tenantId: string,
  ) {}

  async createSignup(data: { email: string; strategy: string; password?: string }) {
    const signupId = `sig_${nanoid()}`;
    const code = otp.generateNumericCode(6);

    // BUG-114 (codex r20): hash the password at create-time when
    // supplied. The strategy=password sign-up flow needs it so the new
    // user can immediately sign in afterwards. Without this, sign-up
    // succeeded but every subsequent sign-in 401'd with "No password
    // set for this account" (auth.service.ts line ~261).
    let passwordDigest: string | undefined;
    if (data.password) {
      if (data.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      passwordDigest = await crypto.hashPassword(data.password);
    }

    pendingSignups.set(signupId, {
      code,
      email: data.email,
      strategy: data.strategy,
      passwordDigest,
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

  async attemptSignup(
    signupId: string,
    code: string,
    _email: string = "pending@example.com",
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    const pending = pendingSignups.get(signupId);
    if (!pending) {
      throw new Error("Signup attempt expired or not found");
    }

    if (code !== pending.code) {
      throw new Error("Invalid verification code");
    }

    const email = pending.email;
    const passwordDigest = pending.passwordDigest;
    pendingSignups.delete(signupId);

    // Check signup restrictions
    const restrictionService = new RestrictionService(this.db);
    const check = await restrictionService.checkSignup(email);
    if (!check.allowed) {
      throw new Error(check.reason ?? "Signup not allowed");
    }

    const userId = `user_${nanoid()}`;
    // BUG-114 (codex r20): install passwordDigest if the create step
    // captured one. Without this, password sign-up succeeds but the
    // user has no credential to sign in with.
    // BUG-120 (codex r21): also set `hasPassword` — the public-facing
    // flag the dashboard / SDK consult to decide whether to offer
    // "set a password" UI. The updateUser flow at line ~201 sets both;
    // signup must match or the user shows up as password-less in
    // every list/get response.
    await this.db.insert(schema.users).values({
      id: userId,
      status: "active",
      ...(passwordDigest ? { passwordDigest, hasPassword: true } : {}),
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

    // BUG-114 (codex r20): always return snake_case `user_id` to match
    // OpenAPI + the Clerk-shaped convention used everywhere else.
    // Additionally, mint a session so the caller is signed in
    // immediately — matches Clerk's behavior and lets the SDK's
    // redirect-on-signup path (which checks `data.session`) trigger.
    const session = await this.createSessionForUser(userId, metadata);
    return {
      user_id: userId,
      ...session,
    };
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

    // BUG-132 (codex r26): persist the pending first-factor attempt so
    // attemptSignin can enforce that `signin_id` came from a real
    // createSignin call. Without this, anyone with valid credentials
    // could POST straight to /v1/auth/signins/sin_fake/attempt and
    // bypass Clerk's documented sign-in lifecycle.
    pendingSignins.set(signinId, {
      stage: "first_factor",
      identifier: data.identifier,
      strategy: data.strategy,
      createdAt: Date.now(),
    });

    // BUG-127 (codex r23): only advertise first-factor strategies the
    // service actually implements. Echoing whatever the caller sent
    // led SDK consumers into 400-only flows (email_code / passkey have
    // no first-factor verification path today). When/if those land,
    // include them here. The `strategy` field echoes the request as
    // before for Clerk parity, but `available_strategies` is the
    // source of truth.
    return {
      id: signinId,
      identifier: data.identifier,
      status: "needs_first_factor" as const,
      strategy: data.strategy,
      mfa_required: mfaRequired,
      available_strategies: ["password"],
    };
  }

  async attemptSignin(
    signinId: string,
    identifier: string,
    password: string,
    strategy: string | undefined,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // BUG-132 (codex r26): require the signin_id to map to a pending
    // first-factor attempt. Rejects bogus / expired ids and asserts
    // the identifier hasn't been swapped between create and attempt
    // (mitigates a confused-deputy scenario where a stolen signin_id
    // gets reused with a different account).
    const pending = pendingSignins.get(signinId);
    if (!pending || pending.stage !== "first_factor") {
      throw new Error("Sign-in attempt expired or not found");
    }
    if (pending.identifier !== identifier) {
      throw new Error("Identifier does not match the original sign-in attempt");
    }

    // BUG-133 (codex r26): same factor-name semantics as BUG-126/131
    // on the second factor. The service today only implements password
    // first-factor verification; explicit-but-unsupported strategies
    // must fail loudly rather than silently fall through to password
    // verification. Undefined falls back to password for back-compat
    // with older callers that don't send strategy.
    if (strategy !== undefined && strategy !== "password") {
      throw new Error(`Unsupported first-factor strategy: "${strategy}". Expected "password".`);
    }

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

    // First-factor done — consume the pending entry. If TOTP is enabled
    // we immediately replace it with a second-factor entry below.
    pendingSignins.delete(signinId);

    // If TOTP is enabled, defer session creation until 2FA is verified
    if (user.totpEnabled) {
      pendingSignins.set(signinId, {
        stage: "second_factor",
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
    strategy: string | undefined,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    const pending = pendingSignins.get(signinId);
    if (!pending) {
      throw new Error("Sign-in attempt expired or not found");
    }
    // BUG-132 (codex r26): require the attempt to have completed first
    // factor before second-factor verification. Otherwise a caller
    // could skip straight to second factor with a stolen signin_id.
    if (pending.stage !== "second_factor") {
      throw new Error("Sign-in attempt is not at the second-factor stage");
    }

    const user = await this.getUser(pending.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // BUG-126 (codex r23): respect the requested factor name. Before
    // this, the verifier tried TOTP first then backup codes regardless
    // of `strategy`, so a `strategy: "totp"` attempt could consume a
    // backup code (silent reduction in security) and a `strategy:
    // "backup_code"` attempt could verify against TOTP (mis-attribution
    // in audit logs). When strategy is omitted, fall back to the old
    // permissive try-both behavior so existing callers don't break.
    const tryTotp = async (): Promise<boolean> => {
      if (!user.totpSecret) return false;
      const totp = new TOTP();
      const result = await totp.verify(code, { secret: user.totpSecret });
      return result.valid;
    };
    const tryBackupCode = async (): Promise<boolean> => {
      const backupCodes = (user.backupCodes ?? []) as string[];
      const codeIndex = backupCodes.indexOf(code);
      if (codeIndex < 0) return false;
      const updatedCodes = [...backupCodes];
      updatedCodes.splice(codeIndex, 1);
      await this.db
        .update(schema.users)
        .set({ backupCodes: updatedCodes, updatedAt: new Date() })
        .where(eq(schema.users.id, user.id));
      return true;
    };

    let verified: boolean;
    if (strategy === "totp") {
      verified = await tryTotp();
    } else if (strategy === "backup_code") {
      verified = await tryBackupCode();
    } else if (strategy === undefined) {
      // BUG-129 (codex r24) / BUG-131 (codex r25): permissive fallback
      // ONLY when strategy is genuinely absent — older callers may not
      // send it. An explicit `strategy: null` (a JSON value, not an
      // absent field) or any unrecognized value (`"password"`,
      // `"email_code"`, typos) fails loudly rather than allow TOTP /
      // backup_code to be silently consumed.
      verified = (await tryTotp()) || (await tryBackupCode());
    } else {
      throw new Error(
        `Unsupported second-factor strategy: "${strategy}". Expected "totp" or "backup_code".`,
      );
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

    // BUG-49 + codex-followup: stamp org_* JWT claims ONLY when the user
    // has exactly one membership (unambiguous active org). For multi-org
    // users the sign-in flow has no input telling us which org the user
    // wants active, so picking `findFirst` would pin a random one into
    // the JWT and the org-switcher's `__blerp_org` cookie would never
    // take effect server-side (because the JWT claim takes precedence in
    // @blerp/nextjs `auth()` for permissions resolution). Users in zero
    // organizations never get the org claims (matches Clerk).
    const memberships = await this.db.query.memberships.findMany({
      where: eq(schema.memberships.userId, userId),
      with: { organization: true },
    });
    const orgClaims: Record<string, unknown> = {};
    if (memberships.length === 1) {
      const m = memberships[0];
      const permissions = await resolvePermissions(this.db, m.organizationId, m.role);
      orgClaims.org_id = m.organizationId;
      orgClaims.org_role = m.role;
      orgClaims.org_slug = m.organization?.slug ?? null;
      orgClaims.org_permissions = permissions;
    }

    const { privateKey } = await getKeyPair();
    const accessToken = await jwt.sign({ sub: userId, sid: sessionId, ...orgClaims }, privateKey, {
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
