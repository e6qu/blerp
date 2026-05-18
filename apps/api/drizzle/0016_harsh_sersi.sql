ALTER TABLE `audit_logs` ADD `project_id` text;--> statement-breakpoint
-- BUG-242 (codex r82): backfill `project_id` from the organization
-- the audit row references. Without this, every pre-r41 audit row
-- has `project_id = NULL` and is filtered out of project-scoped
-- reads (BUG-161) for upgraded tenants — full historical loss for
-- backend SDK callers using a project-scoped token. Rows without
-- an `organization_id` (tenant-system events like `user.created`)
-- stay NULL on purpose; BUG-205/207 treats tenant-root callers as
-- having access to those.
UPDATE `audit_logs` SET `project_id` = (
  SELECT `project_id` FROM `organizations` WHERE `organizations`.`id` = `audit_logs`.`organization_id`
) WHERE `audit_logs`.`organization_id` IS NOT NULL AND `audit_logs`.`project_id` IS NULL;--> statement-breakpoint
CREATE INDEX `audit_logs_project_id_idx` ON `audit_logs` (`project_id`);--> statement-breakpoint
ALTER TABLE `webhook_endpoints` ADD `project_id` text DEFAULT 'default' NOT NULL;