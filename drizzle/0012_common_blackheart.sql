CREATE TABLE `pyq_repeated_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`cluster_id` text NOT NULL,
	`unit_id` text,
	`unit_title` text,
	`repeat_count` integer DEFAULT 1 NOT NULL,
	`years` text NOT NULL,
	`occurrences` text NOT NULL,
	`related_question_ids` text NOT NULL,
	`computed_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_pyq_repeated_cluster` ON `pyq_repeated_cache` (`cluster_id`);--> statement-breakpoint
CREATE INDEX `idx_pyq_repeated_unit` ON `pyq_repeated_cache` (`unit_id`);--> statement-breakpoint
CREATE INDEX `idx_pyq_repeated_count` ON `pyq_repeated_cache` (`repeat_count`);--> statement-breakpoint
CREATE TABLE `pyq_unit_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`year` integer NOT NULL,
	`unit_id` text NOT NULL,
	`unit_title` text NOT NULL,
	`question_count` integer DEFAULT 0 NOT NULL,
	`question_ids` text NOT NULL,
	`computed_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pyq_unit_cache_year_unit_unique` ON `pyq_unit_cache` (`year`,`unit_id`);--> statement-breakpoint
CREATE INDEX `idx_pyq_unit_cache_year` ON `pyq_unit_cache` (`year`);