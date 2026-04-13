CREATE TABLE `mppolice_one_liner_facts` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_tag` text NOT NULL,
	`stem_hi` text NOT NULL,
	`stem_en` text,
	`answer_hi` text NOT NULL,
	`answer_en` text,
	`importance_score` real DEFAULT 0,
	`sort_order` integer DEFAULT 0,
	`extended_data` text,
	`status` text DEFAULT 'draft',
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE INDEX `idx_mppol_ol_subject_status` ON `mppolice_one_liner_facts` (`subject_tag`,`status`);--> statement-breakpoint
CREATE INDEX `idx_mppol_ol_importance` ON `mppolice_one_liner_facts` (`status`,`importance_score`);
