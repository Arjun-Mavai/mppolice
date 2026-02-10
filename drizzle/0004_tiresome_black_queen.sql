CREATE TABLE `pricing_config` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`lite_price` integer DEFAULT 99,
	`lite_original_price` integer DEFAULT 299,
	`lite_validity_text` text DEFAULT 'Valid till MPPSC 2026 Prelims',
	`lite_months` integer DEFAULT 8,
	`pro_price` integer DEFAULT 299,
	`pro_original_price` integer DEFAULT 999,
	`pro_validity_text` text DEFAULT 'Valid till MPPSC 2026 Mains',
	`pro_months` integer DEFAULT 12,
	`upgrade_price` integer DEFAULT 199,
	`upgrade_original_price` integer DEFAULT 299,
	`urgency_text` text DEFAULT 'Special pricing for first 100 students',
	`urgency_text_hi` text DEFAULT 'पहले 100 छात्रों के लिए विशेष मूल्य',
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
