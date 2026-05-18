ALTER TABLE `users` ADD `locked` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `failed_sign_in_attempts` integer DEFAULT 0 NOT NULL;