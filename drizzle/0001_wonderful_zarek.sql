CREATE TABLE `feedbacks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`message` text NOT NULL,
	`rating` integer NOT NULL,
	`category` text DEFAULT 'other',
	`role` text,
	`location` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE INDEX `idx_feedbacks_created_at` ON `feedbacks` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_feedbacks_category` ON `feedbacks` (`category`);--> statement-breakpoint
CREATE INDEX `idx_feedbacks_role` ON `feedbacks` (`role`);--> statement-breakpoint
CREATE TABLE `guests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`mobile` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE INDEX `idx_guests_email` ON `guests` (`email`);--> statement-breakpoint
CREATE INDEX `idx_guests_mobile` ON `guests` (`mobile`);--> statement-breakpoint
CREATE TABLE `test_leaderboard` (
	`id` text PRIMARY KEY NOT NULL,
	`test_id` text NOT NULL,
	`user_id` text,
	`display_name` text NOT NULL,
	`score` real NOT NULL,
	`percentage` real,
	`time_taken_seconds` integer,
	`rank` integer,
	`is_fake` integer DEFAULT 0,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE INDEX `test_score_idx` ON `test_leaderboard` (`test_id`,`score`);--> statement-breakpoint
CREATE INDEX `idx_leaderboard_ranking` ON `test_leaderboard` (`test_id`,`score`,`time_taken_seconds`);--> statement-breakpoint
ALTER TABLE `content_blogs` ADD `unit_id` text;--> statement-breakpoint
ALTER TABLE `content_blogs` ADD `topic_id` text;--> statement-breakpoint
ALTER TABLE `content_blogs` ADD `is_premium` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `mppsc_users` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `mppsc_users` (`email`);--> statement-breakpoint
ALTER TABLE `questions` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `idx_questions_subject` ON `questions` (`test_id`,`subject`);--> statement-breakpoint
ALTER TABLE `tests` ADD `title_en` text;--> statement-breakpoint
ALTER TABLE `tests` ADD `is_free_access` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `tests` ADD `is_lite_access` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `tests` ADD `is_pro_access` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `tests` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `idx_tests_slug` ON `tests` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_tests_type_ispro` ON `tests` (`type`,`is_pro`);--> statement-breakpoint
ALTER TABLE `user_attempts` ADD `deleted_at` integer;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `user_attempts` (`user_id`);--> statement-breakpoint
CREATE INDEX `test_id_idx` ON `user_attempts` (`test_id`);--> statement-breakpoint
CREATE INDEX `user_test_idx` ON `user_attempts` (`user_id`,`test_id`);--> statement-breakpoint
CREATE INDEX `completed_idx` ON `user_attempts` (`is_completed`,`end_time`);--> statement-breakpoint
CREATE INDEX `idx_user_test_completed` ON `user_attempts` (`user_id`,`test_id`,`is_completed`,`end_time`);--> statement-breakpoint
CREATE INDEX `idx_attempts_by_date` ON `user_attempts` (`user_id`,`end_time`);--> statement-breakpoint
CREATE INDEX `idx_user_attempts_completion_score` ON `user_attempts` (`user_id`,`is_completed`,`score`);--> statement-breakpoint
CREATE INDEX `attempt_id_idx` ON `attempt_answers` (`attempt_id`);--> statement-breakpoint
CREATE INDEX `question_id_idx` ON `attempt_answers` (`question_id`);--> statement-breakpoint
CREATE INDEX `idx_attempt_question` ON `attempt_answers` (`attempt_id`,`question_id`);--> statement-breakpoint
CREATE INDEX `unit_order_idx` ON `syllabus_topics` (`unit_id`,`order`);