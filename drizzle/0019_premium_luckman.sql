CREATE TABLE `intelligence_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`question_text` text,
	`test_id` text,
	`reaction` text NOT NULL,
	`message` text,
	`is_pro` integer DEFAULT false,
	`source` text,
	`user_id` text,
	`user_name` text,
	`user_mobile` text,
	`user_email` text,
	`exam_type` text DEFAULT 'mppolice' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pricing_config` (
	`exam_type` text PRIMARY KEY NOT NULL,
	`id` text,
	`lite_price` integer DEFAULT 99,
	`lite_original_price` integer DEFAULT 299,
	`lite_validity_text` text DEFAULT 'Valid till MP Police Constable Exam',
	`lite_months` integer DEFAULT 8,
	`pro_price` integer DEFAULT 299,
	`pro_original_price` integer DEFAULT 999,
	`pro_validity_text` text DEFAULT 'Valid till MP Police SI Exam',
	`pro_months` integer DEFAULT 12,
	`upgrade_price` integer DEFAULT 199,
	`upgrade_original_price` integer DEFAULT 299,
	`urgency_text` text DEFAULT 'Special pricing for first 100 students',
	`urgency_text_hi` text DEFAULT 'पहले 100 छात्रों के लिए विशेष मूल्य',
	`students_bought` integer DEFAULT 23,
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_pricing_config`("exam_type", "id", "lite_price", "lite_original_price", "lite_validity_text", "lite_months", "pro_price", "pro_original_price", "pro_validity_text", "pro_months", "upgrade_price", "upgrade_original_price", "urgency_text", "urgency_text_hi", "students_bought", "updated_at") SELECT 'mppsc', "id", "lite_price", "lite_original_price", "lite_validity_text", "lite_months", "pro_price", "pro_original_price", "pro_validity_text", "pro_months", "upgrade_price", "upgrade_original_price", "urgency_text", "urgency_text_hi", "students_bought", "updated_at" FROM `pricing_config`;--> statement-breakpoint
DROP TABLE `pricing_config`;--> statement-breakpoint
ALTER TABLE `__new_pricing_config` RENAME TO `pricing_config`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `mppsc_users` ADD `session_version` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `tests` ADD `is_instant_mode` integer DEFAULT false;