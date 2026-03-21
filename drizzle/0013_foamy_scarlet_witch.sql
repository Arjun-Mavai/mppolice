CREATE TABLE `test_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`test_id` text NOT NULL,
	`user_id` text,
	`test_type` text NOT NULL,
	`overall_rating` integer NOT NULL,
	`difficulty_level` text NOT NULL,
	`question_quality` text NOT NULL,
	`would_recommend` text NOT NULL,
	`comments` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
