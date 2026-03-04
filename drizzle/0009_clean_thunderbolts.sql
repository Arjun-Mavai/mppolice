CREATE TABLE `free_quiz_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`test_id` text NOT NULL,
	`guest_id` text,
	`score` real,
	`total_questions` integer,
	`percentage` real,
	`time_taken_seconds` integer,
	`completed_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_free_attempts_test` ON `free_quiz_attempts` (`test_id`);--> statement-breakpoint
CREATE INDEX `idx_free_attempts_guest` ON `free_quiz_attempts` (`guest_id`);--> statement-breakpoint
CREATE TABLE `mppsc_user_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`user_email` text NOT NULL,
	`user_name` text,
	`admin_id` text,
	`action` text NOT NULL,
	`details` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE INDEX `idx_activities_user_id` ON `mppsc_user_activities` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_activities_action` ON `mppsc_user_activities` (`action`);--> statement-breakpoint
CREATE INDEX `idx_activities_created_at` ON `mppsc_user_activities` (`created_at`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`order_id` text NOT NULL,
	`payment_id` text,
	`signature` text,
	`amount` integer NOT NULL,
	`plan_tier` text,
	`status` text DEFAULT 'created' NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`receipt` text,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `mppsc_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_payments`("id", "user_id", "order_id", "payment_id", "signature", "amount", "plan_tier", "status", "currency", "receipt", "notes", "created_at", "updated_at") SELECT "id", "user_id", "order_id", "payment_id", "signature", "amount", "plan_tier", "status", "currency", "receipt", "notes", "created_at", "updated_at" FROM `payments`;--> statement-breakpoint
DROP TABLE `payments`;--> statement-breakpoint
ALTER TABLE `__new_payments` RENAME TO `payments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `payments_payment_id_unique` ON `payments` (`payment_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_order_id` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_user_id` ON `payments` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_status` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_payments_payment_id` ON `payments` (`payment_id`);--> statement-breakpoint
CREATE TABLE `__new_topic_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`unit_id` text NOT NULL,
	`revision_count` integer DEFAULT 0,
	`last_revised_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `mppsc_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_topic_revisions`("id", "user_id", "topic_id", "unit_id", "revision_count", "last_revised_at") SELECT "id", "user_id", "topic_id", "unit_id", "revision_count", "last_revised_at" FROM `topic_revisions`;--> statement-breakpoint
DROP TABLE `topic_revisions`;--> statement-breakpoint
ALTER TABLE `__new_topic_revisions` RENAME TO `topic_revisions`;--> statement-breakpoint
CREATE TABLE `__new_user_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`test_id` text NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`score` real,
	`is_completed` integer DEFAULT false,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `mppsc_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`test_id`) REFERENCES `tests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_attempts`("id", "user_id", "test_id", "start_time", "end_time", "score", "is_completed", "deleted_at") SELECT "id", "user_id", "test_id", "start_time", "end_time", "score", "is_completed", "deleted_at" FROM `user_attempts`;--> statement-breakpoint
DROP TABLE `user_attempts`;--> statement-breakpoint
ALTER TABLE `__new_user_attempts` RENAME TO `user_attempts`;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_attempts` (`user_id`);--> statement-breakpoint
CREATE INDEX `test_id_idx` ON `user_attempts` (`test_id`);--> statement-breakpoint
CREATE INDEX `user_test_idx` ON `user_attempts` (`user_id`,`test_id`);--> statement-breakpoint
CREATE INDEX `completed_idx` ON `user_attempts` (`is_completed`,`end_time`);--> statement-breakpoint
CREATE INDEX `idx_user_test_completed` ON `user_attempts` (`user_id`,`test_id`,`is_completed`,`end_time`);--> statement-breakpoint
CREATE INDEX `idx_attempts_by_date` ON `user_attempts` (`user_id`,`end_time`);--> statement-breakpoint
CREATE INDEX `idx_user_attempts_completion_score` ON `user_attempts` (`user_id`,`is_completed`,`score`);--> statement-breakpoint
ALTER TABLE `content_blogs` ADD `excerpt` text;