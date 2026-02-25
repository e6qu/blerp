import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
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
  imageUrl: text("image_url"),
  hasPassword: integer("has_password", { mode: "boolean" }).notNull().default(false),
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
    .references(() => users.id),
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
    .references(() => users.id),
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
    .references(() => users.id),
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

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  organizationId: text("organization_id"),
  status: text("status", { enum: ["active", "revoked", "ended", "expired"] })
    .notNull()
    .default("active"),
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
});

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

export const memberships = sqliteTable("memberships", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull().default("member"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const invitations = sqliteTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id),
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
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// --- Audit Logs ---

export const auditLogs = sqliteTable("audit_logs", {
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
