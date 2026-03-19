CREATE TABLE `redirect_urls` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`type` text DEFAULT 'web' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
