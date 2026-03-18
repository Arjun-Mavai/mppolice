CREATE TABLE `pyq_content_import_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`uploaded_by` text,
	`input_hash` text NOT NULL,
	`total_records` integer,
	`success_count` integer,
	`failure_count` integer,
	`status` text DEFAULT 'pending',
	`error_report` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE INDEX `idx_pyq_jobs_status_created` ON `pyq_content_import_jobs` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `pyq_fact_bank` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`subject` text NOT NULL,
	`fact_text` text NOT NULL,
	`fact_text_en` text,
	`memory_tip` text,
	`memory_tip_en` text,
	`scam_alert` text,
	`scam_alert_en` text,
	`difficulty` text DEFAULT 'medium',
	`frequency_score` real DEFAULT 0,
	`importance_score` real DEFAULT 0,
	`pyq_refs` text DEFAULT '[]' NOT NULL,
	`tags` text DEFAULT '[]',
	`status` text DEFAULT 'draft',
	`source` text DEFAULT 'manual',
	`created_by` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`topic_id`) REFERENCES `pyq_topics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_fact_topic_status` ON `pyq_fact_bank` (`topic_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_fact_subject_status` ON `pyq_fact_bank` (`subject`,`status`);--> statement-breakpoint
CREATE INDEX `idx_fact_importance` ON `pyq_fact_bank` (`status`,`importance_score`);--> statement-breakpoint
CREATE TABLE `pyq_question_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`confidence` real DEFAULT 1,
	`is_primary` integer DEFAULT false,
	`source` text DEFAULT 'manual',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`topic_id`) REFERENCES `pyq_topics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pyq_qt_question_topic_unique` ON `pyq_question_topics` (`question_id`,`topic_id`);--> statement-breakpoint
CREATE INDEX `idx_pyq_qt_topic` ON `pyq_question_topics` (`topic_id`);--> statement-breakpoint
CREATE INDEX `idx_pyq_qt_question` ON `pyq_question_topics` (`question_id`);--> statement-breakpoint
CREATE INDEX `idx_pyq_qt_primary` ON `pyq_question_topics` (`topic_id`,`is_primary`);--> statement-breakpoint
CREATE TABLE `pyq_topic_trends` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`subject` text NOT NULL,
	`year` integer NOT NULL,
	`question_count` integer DEFAULT 0 NOT NULL,
	`weight_percent` real DEFAULT 0 NOT NULL,
	`trend_delta` real DEFAULT 0,
	`computed_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`topic_id`) REFERENCES `pyq_topics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pyq_trends_topic_year_unique` ON `pyq_topic_trends` (`topic_id`,`year`);--> statement-breakpoint
CREATE INDEX `idx_trends_subject_year` ON `pyq_topic_trends` (`subject`,`year`);--> statement-breakpoint
CREATE INDEX `idx_trends_topic_year` ON `pyq_topic_trends` (`topic_id`,`year`);--> statement-breakpoint
CREATE TABLE `pyq_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`topic_slug` text NOT NULL,
	`topic_title` text NOT NULL,
	`topic_title_en` text,
	`description` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pyq_topics_topic_slug_unique` ON `pyq_topics` (`topic_slug`);--> statement-breakpoint
CREATE INDEX `idx_pyq_topics_subject` ON `pyq_topics` (`subject`,`is_active`);