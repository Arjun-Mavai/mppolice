DROP INDEX `idx_guests_mobile`;--> statement-breakpoint
ALTER TABLE `guests` ADD `updated_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_guests_mobile_unique` ON `guests` (`mobile`);