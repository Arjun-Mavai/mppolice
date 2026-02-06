CREATE TABLE `attempt_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`attempt_id` text NOT NULL,
	`question_id` text NOT NULL,
	`user_answer` text,
	`is_correct` integer,
	`time_taken_seconds` integer,
	FOREIGN KEY (`attempt_id`) REFERENCES `user_attempts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `content_blogs` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`image_url` text,
	`reading_time` integer,
	`content_type` text DEFAULT 'blog' NOT NULL,
	`is_published` integer DEFAULT false,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_blogs_slug_unique` ON `content_blogs` (`slug`);--> statement-breakpoint
CREATE TABLE `mppsc_users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text,
	`is_subscribed` integer DEFAULT false,
	`plan_tier` text DEFAULT 'free',
	`role` text DEFAULT 'guest',
	`admin_secret` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mppsc_users_email_unique` ON `mppsc_users` (`email`);--> statement-breakpoint
CREATE TABLE `payment_exit_reasons` (
	`id` text PRIMARY KEY NOT NULL,
	`reason` text NOT NULL,
	`custom_reason` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`test_id` text NOT NULL,
	`question_text` text NOT NULL,
	`question_text_en` text,
	`options` text NOT NULL,
	`correct_answer` text NOT NULL,
	`explanation` text,
	`explanation_en` text,
	`marks` integer NOT NULL,
	`negative_marks` real DEFAULT 1,
	`ideal_time` integer DEFAULT 60,
	`order` integer NOT NULL,
	`subject` text,
	`type` text DEFAULT 'standard',
	`match_pairs` text,
	FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`category` text DEFAULT 'general',
	`message` text NOT NULL,
	`status` text DEFAULT 'open',
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `syllabus_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`title` text NOT NULL,
	`title_en` text,
	`content` text NOT NULL,
	`content_en` text,
	`ai_content` text,
	`ai_content_en` text,
	`order` integer NOT NULL,
	`is_free` integer DEFAULT false,
	`img_url` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `tests` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`slug` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`total_questions` integer DEFAULT 0,
	`total_marks` integer NOT NULL,
	`type` text NOT NULL,
	`unit_id` text,
	`topic_id` text,
	`tags` text,
	`is_pro` integer DEFAULT false,
	`display_order` integer DEFAULT 0,
	`max_retries` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tests_slug_unique` ON `tests` (`slug`);--> statement-breakpoint
CREATE TABLE `topic_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`unit_id` text NOT NULL,
	`revision_count` integer DEFAULT 0,
	`last_revised_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `mppsc_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`test_id` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`score` real,
	`is_completed` integer DEFAULT false,
	FOREIGN KEY (`user_id`) REFERENCES `mppsc_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON UPDATE no action ON DELETE no action
);
