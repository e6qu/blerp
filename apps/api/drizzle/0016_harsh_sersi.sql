ALTER TABLE `audit_logs` ADD `project_id` text;--> statement-breakpoint
CREATE INDEX `audit_logs_project_id_idx` ON `audit_logs` (`project_id`);--> statement-breakpoint
ALTER TABLE `webhook_endpoints` ADD `project_id` text DEFAULT 'default' NOT NULL;