import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// --- Projects & Environments ---

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// --- Users & Identities ---

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  primaryEmailAddressId: text("primary_email_address_id"),
  primaryPhoneNumberId: text("primary_phone_number_id"),
  passwordDigest: text("password_digest"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  username: text("username").unique(),
  imageUrl: text("image_url"),
  hasPassword: integer("has_password", { mode: "boolean" }).notNull().default(false),
  totpSecret: text("totp_secret"),
  totpEnabled: integer("totp_enabled", { mode: "boolean" }).notNull().default(false),
  backupCodes: text("backup_codes", { mode: "json" }).notNull().default("[]"),
  publicMetadata: text("public_metadata", { mode: "json" }).notNull().default("{}"),
  privateMetadata: text("private_metadata", { mode: "json" }).notNull().default("{}"),
  unsafeMetadata: text("unsafe_metadata", { mode: "json" }).notNull().default("{}"),
  status: text("status", { enum: ["active", "inactive", "banned"] })
    .notNull()
    .default("active"),
  lastSignInAt: integer("last_sign_in_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const emailAddresses = sqliteTable("email_addresses", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  emailAddress: text("email_address").notNull().unique(),
  verificationStatus: text("verification_status", { enum: ["verified", "unverified"] })
    .notNull()
    .default("unverified"),
  verificationStrategy: text("verification_strategy"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const phoneNumbers = sqliteTable("phone_numbers", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  phoneNumber: text("phone_number").notNull().unique(),
  verificationStatus: text("verification_status", { enum: ["verified", "unverified"] })
    .notNull()
    .default("unverified"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const oauthAccounts = sqliteTable("oauth_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerUserId: text("provider_user_id").notNull(),
  emailAddress: text("email_address").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  scopes: text("scopes", { mode: "json" }).notNull().default("[]"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// --- Sessions ---

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id"),
    status: text("status", { enum: ["active", "revoked", "ended", "expired"] })
      .notNull()
      .default("active"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    lastActiveAt: integer("last_active_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    expireAt: integer("expire_at", { mode: "timestamp" }).notNull(),
    abandonAt: integer("abandon_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  }),
);

// --- Organizations ---

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  publicMetadata: text("public_metadata", { mode: "json" }).notNull().default("{}"),
  privateMetadata: text("private_metadata", { mode: "json" }).notNull().default("{}"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const memberships = sqliteTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    orgUserIdx: index("memberships_org_user_idx").on(table.organizationId, table.userId),
  }),
);

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  emailAddress: text("email_address").notNull(),
  role: text("role").notNull().default("member"),
  status: text("status", { enum: ["pending", "accepted", "revoked"] })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// --- API Keys ---

export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  environment: text("environment", { enum: ["development", "staging", "production"] }).notNull(),
  type: text("type", { enum: ["publishable", "secret"] }).notNull(),
  key: text("key").notNull().unique(),
  label: text("label"),
  status: text("status", { enum: ["active", "revoked"] })
    .notNull()
    .default("active"),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// --- Audit Logs ---

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    organizationId: text("organization_id"),
    action: text("action").notNull(),
    actor: text("actor", { mode: "json" }).notNull(),
    payload: text("payload", { mode: "json" }).notNull().default("{}"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
    organizationIdIdx: index("audit_logs_org_id_idx").on(table.organizationId),
  }),
);

export const webhookEndpoints = sqliteTable("webhook_endpoints", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  eventTypes: text("event_types", { mode: "json" }).notNull().default("[]"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
  emailAddresses: many(emailAddresses),
  phoneNumbers: many(phoneNumbers),
  oauthAccounts: many(oauthAccounts),
  sessions: many(sessions),
  memberships: many(memberships),
}));

export const emailAddressesRelations = relations(emailAddresses, ({ one }) => ({
  user: one(users, { fields: [emailAddresses.userId], references: [users.id] }),
}));

export const phoneNumbersRelations = relations(phoneNumbers, ({ one }) => ({
  user: one(users, { fields: [phoneNumbers.userId], references: [users.id] }),
}));

export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, { fields: [oauthAccounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
  organization: one(organizations, {
    fields: [sessions.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  invitations: many(invitations),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
}));

export const passkeys = sqliteTable("passkeys", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  publicKey: text("public_key").notNull(),
  counter: integer("counter").notNull().default(0),
  credentialId: text("credential_id").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
});

// --- Signup Restrictions (Allowlist/Blocklist) ---

export const signupRestrictions = sqliteTable("signup_restrictions", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["allowlist", "blocklist"] }).notNull(),
  identifierType: text("identifier_type", { enum: ["email", "domain"] }).notNull(),
  value: text("value").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// --- Sign-In Tokens (Magic Links) ---

export const signInTokens = sqliteTable("sign_in_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  status: text("status", { enum: ["pending", "accepted", "revoked", "expired"] })
    .notNull()
    .default("pending"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// --- Webhook Delivery Logs ---

export const webhookDeliveries = sqliteTable(
  "webhook_deliveries",
  {
    id: text("id").primaryKey(),
    endpointId: text("endpoint_id")
      .notNull()
      .references(() => webhookEndpoints.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    status: text("status", { enum: ["success", "failed", "pending"] })
      .notNull()
      .default("pending"),
    httpStatus: integer("http_status"),
    responseBody: text("response_body"),
    errorMessage: text("error_message"),
    attemptNumber: integer("attempt_number").notNull().default(1),
    deliveredAt: integer("delivered_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    endpointIdIdx: index("webhook_deliveries_endpoint_id_idx").on(table.endpointId),
  }),
);

// --- Redirect URLs ---

export const redirectUrls = sqliteTable("redirect_urls", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  type: text("type", { enum: ["web", "native"] })
    .notNull()
    .default("web"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// --- Custom Roles ---

export const customRoles = sqliteTable(
  "custom_roles",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    permissions: text("permissions", { mode: "json" }).notNull().default("[]"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    orgNameIdx: index("custom_roles_org_name_idx").on(table.organizationId, table.name),
  }),
);

// --- M2M Tokens ---

export const m2mTokens = sqliteTable("m2m_tokens", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  name: text("name").notNull(),
  clientId: text("client_id").notNull().unique(),
  clientSecretHash: text("client_secret_hash").notNull(),
  scopes: text("scopes", { mode: "json" }).notNull().default("[]"),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const customRolesRelations = relations(customRoles, ({ one }) => ({
  organization: one(organizations, {
    fields: [customRoles.organizationId],
    references: [organizations.id],
  }),
}));

export const m2mTokensRelations = relations(m2mTokens, ({ one }) => ({
  project: one(projects, {
    fields: [m2mTokens.projectId],
    references: [projects.id],
  }),
}));

export const organizationDomains = sqliteTable("organization_domains", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  domain: text("domain").notNull().unique(),
  verificationStatus: text("verification_status", { enum: ["verified", "unverified"] })
    .notNull()
    .default("unverified"),
  verificationToken: text("verification_token").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
