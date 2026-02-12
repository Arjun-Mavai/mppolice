CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
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
	FOREIGN KEY (`user_id`) REFERENCES `mppsc_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_payment_id_unique` ON `payments` (`payment_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_order_id` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_user_id` ON `payments` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_status` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_payments_payment_id` ON `payments` (`payment_id`);--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE INDEX `idx_verification_tokens_identifier` ON `verification_tokens` (`identifier`);--> statement-breakpoint
CREATE INDEX `idx_verification_tokens_token` ON `verification_tokens` (`token`);--> statement-breakpoint
ALTER TABLE `content_blogs` ADD `is_hidden` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `tests` ADD `is_hidden` integer DEFAULT false;