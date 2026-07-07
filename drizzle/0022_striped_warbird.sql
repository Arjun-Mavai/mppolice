ALTER TABLE `support_conversations` ADD `exam_type` text DEFAULT 'mppolice' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_support_conv_exam_type` ON `support_conversations` (`exam_type`);--> statement-breakpoint
ALTER TABLE `support_messages` ADD `exam_type` text DEFAULT 'mppolice' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_support_msg_exam_type` ON `support_messages` (`exam_type`);