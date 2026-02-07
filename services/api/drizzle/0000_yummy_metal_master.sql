CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`github_pat` text,
	`github_owner` text,
	`github_repo` text,
	`jira_host` text,
	`jira_email` text,
	`jira_api_token` text,
	`jira_project_key` text,
	`slack_webhook_url` text,
	`ai_provider` text,
	`ai_api_key` text,
	`ai_model` text,
	`webhook_key` text NOT NULL,
	`dod_checklist` text,
	`daily_scrum_enabled` integer DEFAULT false,
	`daily_scrum_cron` text,
	`daily_scrum_timezone` text DEFAULT 'Asia/Seoul',
	`jira_fallback_enabled` integer DEFAULT true,
	`jira_fallback_days` integer DEFAULT 7,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_webhook_key_unique` ON `projects` (`webhook_key`);--> statement-breakpoint
CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`event_type` text NOT NULL,
	`event_source` text,
	`pr_number` integer,
	`pr_title` text,
	`jira_issue_key` text,
	`status` text NOT NULL,
	`summary` text,
	`details` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
