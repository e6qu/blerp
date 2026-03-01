ALTER TABLE `api_keys` ADD `label` text;--> statement-breakpoint
ALTER TABLE `api_keys` ADD `status` text DEFAULT 'active' NOT NULL;