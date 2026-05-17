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
// BUG-135 (codex r27): max wrong-code attempts per pending sign-in
// before we refuse to revalidate. Matches the spirit of Clerk's
// `locked` user status — once exceeded, the only remediation is a
// fresh createSignin / second-factor re-enrol.
const MAX_SIGNIN_ATTEMPTS = 5;

interface PendingFirstFactor {
  stage: "first_factor";
  identifier: string;
  strategy: string;
  createdAt: number;
  failedAttempts: number;
}
interface PendingSecondFactor {
  stage: "second_factor";
  userId: string;
  identifier: string;
  ipAddress?: string;
  userAgent?: string;
  failedAttempts: number;
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

    // BUG-166 (codex r42): sign-up is genuinely tenant-system level —
    // the new user isn't yet enrolled in any project. Pass `null`
    // explicitly so the worker's project filter routes this to the
    // legacy "default" bucket (matches pre-r41 behaviour) rather
    // than silently dropping it.
    await eventBus.emit("user.created", this.tenantId, { userId }, null);

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

    // BUG-137 (codex r28): per-user lockout persists across
    // createSignin calls so 5 wrong-password attempts can't be "reset"
    // by starting fresh sign-ins. An admin must explicitly unlock
    // (PATCH /v1/users/:user_id/unlock).
    if (user.locked) {
      throw new Error(
        "Account is locked after too many failed sign-in attempts. Contact an administrator.",
      );
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
      failedAttempts: 0,
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
    // first-factor attempt.
    //
    // BUG-134 (codex r27): atomic check-and-consume — `pop()` removes
    // the entry as it's returned so two concurrent valid attempts
    // can't both pass the stage check and mint multiple sessions. If
    // verification fails for a wrong-credential reason (vs. terminal
    // forged-id / wrong-identifier), we restore the entry below with
    // an incremented failure counter (BUG-135).
    const pending = pendingSignins.pop(signinId);
    if (!pending || pending.stage !== "first_factor") {
      throw new Error("Sign-in attempt expired or not found");
    }
    if (pending.identifier !== identifier) {
      // Terminal — do NOT restore; a swapped identifier is a forged
      // / replay attempt, not a typo.
      throw new Error("Identifier does not match the original sign-in attempt");
    }
    // BUG-135 (codex r27): refuse if the attempt has already locked.
    if (pending.failedAttempts >= MAX_SIGNIN_ATTEMPTS) {
      throw new Error(
        "Sign-in attempt locked after too many failed attempts. Start a new sign-in.",
      );
    }

    // BUG-133 (codex r26): same factor-name semantics as BUG-126/131
    // on the second factor. The service today only implements password
    // first-factor verification; explicit-but-unsupported strategies
    // must fail loudly rather than silently fall through to password
    // verification. Undefined falls back to password for back-compat
    // with older callers that don't send strategy.
    if (strategy !== undefined && strategy !== "password") {
      // Terminal — don't restore. The strategy is wrong, not the
      // credential; restoring would let the caller burn through
      // attempts without ever submitting valid input.
      throw new Error(`Unsupported first-factor strategy: "${strategy}". Expected "password".`);
    }

    // BUG-134 (codex r27) / BUG-137 (codex r28): on a wrong-credential,
    // (a) restore the pending entry with an incremented per-attempt
    // counter (BUG-135), and (b) bump the persistent per-user counter
    // and lock the account if it crosses MAX_SIGNIN_ATTEMPTS. Anything
    // else terminal does NOT restore.
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
    // Re-check lockout after the user lookup — a parallel attempt may
    // have locked the account between createSignin and this call.
    if (user.locked) {
      throw new Error(
        "Account is locked after too many failed sign-in attempts. Contact an administrator.",
      );
    }
    if (!user.passwordDigest) {
      throw new Error("No password set for this account");
    }
    const restoreWithFailure = () => {
      pendingSignins.set(signinId, {
        ...pending,
        failedAttempts: pending.failedAttempts + 1,
      });
    };
    // BUG-139 (codex r29): atomic increment. Pre-fix, two concurrent
    // wrong attempts both read `failedSignInAttempts = 0` and both
    // wrote `1` (last-write-wins), so the counter never advanced past
    // 1 under contention. Using a SQL fragment evaluates the increment
    // and the lock decision inside the UPDATE — SQLite serialises the
    // write so each call observes the row's freshest value.
    const bumpUserFailures = async () => {
      await this.db
        .update(schema.users)
        .set({
          failedSignInAttempts: sql`${schema.users.failedSignInAttempts} + 1`,
          locked: sql`(${schema.users.failedSignInAttempts} + 1) >= ${MAX_SIGNIN_ATTEMPTS}`,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, user.id));
    };

    const valid = await crypto.verifyPassword(user.passwordDigest, password);
    if (!valid) {
      restoreWithFailure();
      await bumpUserFailures();
      throw new Error("Invalid email or password");
    }
    // BUG-137: reset the per-user counter on success.
    // BUG-141 (codex r30) / BUG-148 (codex r33): atomic check-and-
    // reset on success. The second-factor branch is unchanged here
    // (TOTP path doesn't INSERT a session yet). The first-factor-only
    // success path passes the unlocked-at-reset-time signal forward
    // to `createSessionForUser`, which uses a conditional INSERT
    // (`INSERT … SELECT … FROM users WHERE locked = false`) so even
    // if a parallel wrong attempt locks the user between reset and
    // INSERT, the session row never lands and we throw.
    const resetRows = await this.db
      .update(schema.users)
      .set({ failedSignInAttempts: 0, updatedAt: new Date() })
      .where(and(eq(schema.users.id, user.id), eq(schema.users.locked, false)))
      .returning({ id: schema.users.id });
    if (resetRows.length === 0) {
      throw new Error(
        "Account is locked after too many failed sign-in attempts. Contact an administrator.",
      );
    }

    // First-factor done — pending entry already consumed via pop().
    // If TOTP is enabled, install an elevated second-factor entry.
    if (user.totpEnabled) {
      pendingSignins.set(signinId, {
        stage: "second_factor",
        userId: user.id,
        identifier,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        failedAttempts: 0,
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
    // BUG-134 (codex r27): atomic check-and-consume — same pattern as
    // attemptSignin. Two concurrent valid second-factor attempts can't
    // both succeed; the loser sees "expired or not found". Backup-code
    // double-consumption (one of the original codex concerns) is
    // closed by-product: only the pop-winner reaches tryBackupCode.
    const pending = pendingSignins.pop(signinId);
    if (!pending) {
      throw new Error("Sign-in attempt expired or not found");
    }
    if (pending.stage !== "second_factor") {
      throw new Error("Sign-in attempt is not at the second-factor stage");
    }
    if (pending.failedAttempts >= MAX_SIGNIN_ATTEMPTS) {
      throw new Error(
        "Sign-in attempt locked after too many failed attempts. Start a new sign-in.",
      );
    }

    const user = await this.getUser(pending.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const restoreWithFailure = () => {
      pendingSignins.set(signinId, {
        ...pending,
        failedAttempts: pending.failedAttempts + 1,
      });
    };

    // BUG-126 (codex r23): respect the requested factor name.
    const tryTotp = async (): Promise<boolean> => {
      if (!user.totpSecret) return false;
      const totp = new TOTP();
      const result = await totp.verify(code, { secret: user.totpSecret });
      return result.valid;
    };
    // BUG-136 (codex r28) revisited: atomic backup-code consumption.
    // The prior read-modify-write raced across two pending sign-ins
    // for the SAME user. better-sqlite3 transactions don't support
    // async callbacks (see BUG-146 note), so wrap the consume in a
    // single UPDATE that does the array-filter at SQL time via
    // `json_each`. The `returning()` tells us whether the code was
    // present at write time — concurrent callers see the row in
    // exactly one ordering (SQLite serialises writes per connection),
    // so exactly one observes the code present.
    const tryBackupCode = async (): Promise<boolean> => {
      const result = await this.db
        .update(schema.users)
        .set({
          backupCodes: sql`(SELECT json_group_array(value) FROM json_each(${schema.users.backupCodes}) WHERE value != ${code})`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.users.id, user.id),
            // EXISTS clause runs against the row's current backup_codes
            // — atomic with the UPDATE on the same row.
            sql`EXISTS (SELECT 1 FROM json_each(${schema.users.backupCodes}) WHERE value = ${code})`,
          ),
        )
        .returning({ id: schema.users.id });
      return result.length > 0;
    };

    let verified: boolean;
    if (strategy === "totp") {
      verified = await tryTotp();
    } else if (strategy === "backup_code") {
      verified = await tryBackupCode();
    } else if (strategy === undefined) {
      verified = (await tryTotp()) || (await tryBackupCode());
    } else {
      // Terminal — wrong strategy, not wrong code; don't restore.
      throw new Error(
        `Unsupported second-factor strategy: "${strategy}". Expected "totp" or "backup_code".`,
      );
    }

    if (!verified) {
      restoreWithFailure();
      throw new Error("Invalid verification code");
    }

    // BUG-143 (codex r31): atomic check-and-touch — only succeed if
    // user is still unlocked at write time. See BUG-146 note above
    // for why this isn't wrapped in db.transaction (better-sqlite3
    // tx callbacks must be synchronous).
    const stillUnlocked = await this.db
      .update(schema.users)
      .set({ updatedAt: new Date() })
      .where(and(eq(schema.users.id, user.id), eq(schema.users.locked, false)))
      .returning({ id: schema.users.id });
    if (stillUnlocked.length === 0) {
      throw new Error(
        "Account is locked after too many failed sign-in attempts. Contact an administrator.",
      );
    }

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
    const db = this.db;
    const sessionId = `ses_${nanoid()}`;
    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const abandonAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // BUG-148 (codex r33): conditional INSERT — the session row only
    // lands if the user is still unlocked at write time. Without this,
    // a parallel wrong-attempt burst could lock the user between the
    // caller's `UPDATE … WHERE locked=false RETURNING` check and the
    // INSERT below, leaving the locked user with a fresh session.
    // SQLite serialises writes per connection so the INSERT's `SELECT
    // … FROM users WHERE id = ? AND locked = false` evaluates the row
    // at write time. Net effect: if locked, 0 rows inserted, RETURNING
    // is empty → throw.
    // drizzle better-sqlite3 .all() is synchronous; the `await` would
    // be a no-op and the linter flags it. Cast through unknown to keep
    // the typed return shape without an unsafe `as` on the wire type.
    const inserted = db.all<{ id: string }>(sql`
      INSERT INTO sessions
        (id, user_id, status, ip_address, user_agent, expire_at, abandon_at, created_at, updated_at)
      SELECT
        ${sessionId},
        users.id,
        'active',
        ${metadata?.ipAddress ?? null},
        ${metadata?.userAgent ?? null},
        ${Math.floor(expireAt.getTime() / 1000)},
        ${Math.floor(abandonAt.getTime() / 1000)},
        unixepoch(),
        unixepoch()
      FROM users
      WHERE users.id = ${userId} AND users.locked = false
      RETURNING id
    `);
    if (inserted.length === 0) {
      throw new Error(
        "Account is locked after too many failed sign-in attempts. Contact an administrator.",
      );
    }

    // Update last sign in
    await db
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
    const memberships = await db.query.memberships.findMany({
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
    // BUG-155 (codex r37): bind session JWTs to their tenant the same
    // way M2M tokens are (BUG-149). Without this, a session minted in
    // tenant A could be replayed against tenant B by setting
    // X-Tenant-Id: tenantB — the JWT signature verifies (shared
    // signing key across tenants) and authMiddleware previously never
    // checked tenant. The `tenant_id` claim is verified server-side in
    // authMiddleware.
    const accessToken = await jwt.sign(
      { sub: userId, sid: sessionId, tenant_id: this.tenantId, ...orgClaims },
      privateKey,
      {
        issuer: "blerp",
        audience: "blerp-api",
        expiresIn: "7d",
      },
    );

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
