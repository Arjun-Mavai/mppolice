ALTER TABLE `mppsc_users` ADD `category` text DEFAULT 'UR';--> statement-breakpoint
ALTER TABLE `mppsc_users` ADD `gender` text DEFAULT 'M';--> statement-breakpoint
ALTER TABLE `pyq_topics` ADD `ai_content` text;--> statement-breakpoint
ALTER TABLE `tests` ADD `cutoffs` text;--> statement-breakpoint
ALTER TABLE `user_attempts` ADD `created_at` integer DEFAULT (strftime('%s', 'now'));