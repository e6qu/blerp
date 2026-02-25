ALTER TABLE `organizations` ADD `project_id` text NOT NULL REFERENCES projects(id);--> statement-breakpoint
ALTER TABLE `projects` ADD `project_id` text NOT NULL REFERENCES projects(id);