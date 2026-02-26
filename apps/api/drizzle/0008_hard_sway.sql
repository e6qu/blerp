CREATE INDEX `audit_logs_user_id_idx` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_org_id_idx` ON `audit_logs` (`organization_id`);--> statement-breakpoint
CREATE INDEX `memberships_org_user_idx` ON `memberships` (`organization_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);