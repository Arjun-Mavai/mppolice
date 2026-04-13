CREATE TABLE `mppolice_one_liner_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`fact_id` text NOT NULL,
	`revision_count` integer DEFAULT 0,
	`last_revised_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `mppsc_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fact_id`) REFERENCES `mppolice_one_liner_facts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_mppol_rel_user` ON `mppolice_one_liner_revisions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_mppol_rel_fact` ON `mppolice_one_liner_revisions` (`fact_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_mppol_rel_user_fact` ON `mppolice_one_liner_revisions` (`user_id`,`fact_id`);