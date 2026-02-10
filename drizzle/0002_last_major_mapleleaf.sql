ALTER TABLE `content_blogs` ADD `is_free_access` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `content_blogs` ADD `is_lite_access` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `content_blogs` ADD `is_pro_access` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `syllabus_topics` ADD `is_lite_access` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `syllabus_topics` ADD `is_pro_access` integer DEFAULT true;