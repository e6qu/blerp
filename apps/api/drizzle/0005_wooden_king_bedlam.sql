PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_email_addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email_address` text NOT NULL,
	`verification_status` text DEFAULT 'unverified' NOT NULL,
	`verification_strategy` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_email_addresses`("id", "user_id", "email_address", "verification_status", "verification_strategy", "created_at", "updated_at") SELECT "id", "user_id", "email_address", "verification_status", "verification_strategy", "created_at", "updated_at" FROM `email_addresses`;--> statement-breakpoint
DROP TABLE `email_addresses`;--> statement-breakpoint
ALTER TABLE `__new_email_addresses` RENAME TO `email_addresses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `email_addresses_email_address_unique` ON `email_addresses` (`email_address`);--> statement-breakpoint
CREATE TABLE `__new_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_memberships`("id", "organization_id", "user_id", "role", "created_at", "updated_at") SELECT "id", "organization_id", "user_id", "role", "created_at", "updated_at" FROM `memberships`;--> statement-breakpoint
DROP TABLE `memberships`;--> statement-breakpoint
ALTER TABLE `__new_memberships` RENAME TO `memberships`;--> statement-breakpoint
CREATE TABLE `__new_oauth_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_user_id` text NOT NULL,
	`email_address` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`image_url` text,
	`access_token` text,
	`refresh_token` text,
	`scopes` text DEFAULT '[]' NOT NULL,
	`expires_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_oauth_accounts`("id", "user_id", "provider", "provider_user_id", "email_address", "first_name", "last_name", "image_url", "access_token", "refresh_token", "scopes", "expires_at", "created_at", "updated_at") SELECT "id", "user_id", "provider", "provider_user_id", "email_address", "first_name", "last_name", "image_url", "access_token", "refresh_token", "scopes", "expires_at", "created_at", "updated_at" FROM `oauth_accounts`;--> statement-breakpoint
DROP TABLE `oauth_accounts`;--> statement-breakpoint
ALTER TABLE `__new_oauth_accounts` RENAME TO `oauth_accounts`;--> statement-breakpoint
CREATE TABLE `__new_phone_numbers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`phone_number` text NOT NULL,
	`verification_status` text DEFAULT 'unverified' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_phone_numbers`("id", "user_id", "phone_number", "verification_status", "created_at", "updated_at") SELECT "id", "user_id", "phone_number", "verification_status", "created_at", "updated_at" FROM `phone_numbers`;--> statement-breakpoint
DROP TABLE `phone_numbers`;--> statement-breakpoint
ALTER TABLE `__new_phone_numbers` RENAME TO `phone_numbers`;--> statement-breakpoint
CREATE UNIQUE INDEX `phone_numbers_phone_number_unique` ON `phone_numbers` (`phone_number`);--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`organization_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`last_active_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expire_at` integer NOT NULL,
	`abandon_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "user_id", "organization_id", "status", "last_active_at", "expire_at", "abandon_at", "created_at", "updated_at") SELECT "id", "user_id", "organization_id", "status", "last_active_at", "expire_at", "abandon_at", "created_at", "updated_at" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;