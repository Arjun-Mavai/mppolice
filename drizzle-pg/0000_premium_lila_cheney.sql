CREATE TABLE "attempt_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"question_id" text NOT NULL,
	"user_answer" text,
	"is_correct" boolean,
	"time_taken_seconds" integer
);
--> statement-breakpoint
CREATE TABLE "content_blogs" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"excerpt" text,
	"content" jsonb NOT NULL,
	"category" text NOT NULL,
	"exam_type" text DEFAULT 'mppolice' NOT NULL,
	"image_url" text,
	"reading_time" integer,
	"content_type" text DEFAULT 'blog' NOT NULL,
	"unit_id" text,
	"topic_id" text,
	"is_premium" boolean DEFAULT true,
	"is_free_access" boolean DEFAULT false,
	"is_lite_access" boolean DEFAULT false,
	"is_pro_access" boolean DEFAULT true,
	"is_published" boolean DEFAULT false,
	"is_hidden" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "content_blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"message" text NOT NULL,
	"rating" integer NOT NULL,
	"category" text DEFAULT 'other',
	"role" text,
	"location" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"exam_type" text DEFAULT 'mppolice' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "free_quiz_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"guest_id" text,
	"score" double precision,
	"total_questions" integer,
	"percentage" double precision,
	"time_taken_seconds" integer,
	"completed_at" timestamp with time zone DEFAULT now(),
	"exam_type" text DEFAULT 'mppolice' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"mobile" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"exam_type" text DEFAULT 'mppolice' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intelligence_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"question_text" text,
	"test_id" text,
	"reaction" text NOT NULL,
	"message" text,
	"is_pro" boolean DEFAULT false,
	"source" text,
	"user_id" text,
	"user_name" text,
	"user_mobile" text,
	"user_email" text,
	"exam_type" text DEFAULT 'mppolice' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mppolice_one_liner_facts" (
	"id" text PRIMARY KEY NOT NULL,
	"subject_tag" text NOT NULL,
	"stem_hi" text NOT NULL,
	"stem_en" text,
	"answer_hi" text NOT NULL,
	"answer_en" text,
	"importance_score" double precision DEFAULT 0,
	"sort_order" integer DEFAULT 0,
	"extended_data" jsonb,
	"status" text DEFAULT 'draft',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mppolice_one_liner_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"fact_id" text NOT NULL,
	"revision_count" integer DEFAULT 0,
	"last_revised_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mppsc_user_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"user_email" text NOT NULL,
	"user_name" text,
	"admin_id" text,
	"action" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mppsc_users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"is_subscribed" boolean DEFAULT false,
	"plan_tier" text DEFAULT 'free',
	"role" text DEFAULT 'guest',
	"admin_secret" text,
	"deleted_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"session_version" integer DEFAULT 1,
	"access_expires_at" timestamp with time zone,
	"phone" text,
	"category" text DEFAULT 'UR',
	"gender" text DEFAULT 'M',
	"metadata" jsonb,
	"previous_user_id" text,
	"exam_type" text DEFAULT 'mppolice' NOT NULL,
	CONSTRAINT "mppsc_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "payment_exit_reasons" (
	"id" text PRIMARY KEY NOT NULL,
	"reason" text NOT NULL,
	"custom_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"exam_type" text DEFAULT 'mppolice' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"order_id" text NOT NULL,
	"payment_id" text,
	"signature" text,
	"amount" integer NOT NULL,
	"plan_tier" text,
	"status" text DEFAULT 'created' NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"receipt" text,
	"notes" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"exam_type" text DEFAULT 'mppolice' NOT NULL,
	CONSTRAINT "payments_payment_id_unique" UNIQUE("payment_id")
);
--> statement-breakpoint
CREATE TABLE "pricing_config" (
	"exam_type" text PRIMARY KEY NOT NULL,
	"lite_price" integer DEFAULT 99,
	"lite_original_price" integer DEFAULT 299,
	"lite_validity_text" text DEFAULT 'Valid till MP Police Constable Exam',
	"lite_months" integer DEFAULT 8,
	"pro_price" integer DEFAULT 299,
	"pro_original_price" integer DEFAULT 999,
	"pro_validity_text" text DEFAULT 'Valid till MP Police SI Exam',
	"pro_months" integer DEFAULT 12,
	"upgrade_price" integer DEFAULT 199,
	"upgrade_original_price" integer DEFAULT 299,
	"urgency_text" text DEFAULT 'Special pricing for first 100 students',
	"urgency_text_hi" text DEFAULT 'पहले 100 छात्रों के लिए विशेष मूल्य',
	"students_bought" integer DEFAULT 23,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pyq_content_import_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"uploaded_by" text,
	"input_hash" text NOT NULL,
	"total_records" integer,
	"success_count" integer,
	"failure_count" integer,
	"status" text DEFAULT 'pending',
	"error_report" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pyq_fact_bank" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"subject" text NOT NULL,
	"fact_text" text NOT NULL,
	"fact_text_en" text,
	"memory_tip" text,
	"memory_tip_en" text,
	"scam_alert" text,
	"scam_alert_en" text,
	"difficulty" text DEFAULT 'medium',
	"frequency_score" double precision DEFAULT 0,
	"importance_score" double precision DEFAULT 0,
	"pyq_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'draft',
	"source" text DEFAULT 'manual',
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pyq_question_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"confidence" double precision DEFAULT 1,
	"is_primary" boolean DEFAULT false,
	"source" text DEFAULT 'manual',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pyq_repeated_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"cluster_id" text NOT NULL,
	"unit_id" text,
	"unit_title" text,
	"repeat_count" integer DEFAULT 1 NOT NULL,
	"years" jsonb NOT NULL,
	"occurrences" jsonb NOT NULL,
	"related_question_ids" jsonb NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pyq_topic_trends" (
	"id" text PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"subject" text NOT NULL,
	"year" integer NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"weight_percent" double precision DEFAULT 0 NOT NULL,
	"trend_delta" double precision DEFAULT 0,
	"computed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pyq_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"topic_slug" text NOT NULL,
	"topic_title" text NOT NULL,
	"topic_title_en" text,
	"description" text,
	"ai_content" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pyq_unit_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"unit_id" text NOT NULL,
	"unit_title" text NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"question_ids" jsonb NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"question_text" text NOT NULL,
	"question_text_en" text,
	"options" jsonb NOT NULL,
	"correct_answer" text NOT NULL,
	"explanation" text,
	"explanation_en" text,
	"marks" integer NOT NULL,
	"negative_marks" double precision DEFAULT 1,
	"ideal_time" integer DEFAULT 60,
	"order" integer NOT NULL,
	"subject" text,
	"type" text DEFAULT 'standard',
	"match_pairs" jsonb,
	"extended_data" jsonb,
	"deleted_at" timestamp with time zone,
	"exam_type" text DEFAULT 'mppolice' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"guest_id" text,
	"guest_name" text,
	"guest_phone" text,
	"language" text DEFAULT 'PENDING',
	"status" text DEFAULT 'open',
	"human_active" boolean DEFAULT false,
	"unread_count" integer DEFAULT 0,
	"last_message_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"exam_type" text DEFAULT 'mppolice' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender" text NOT NULL,
	"text" text NOT NULL,
	"media_url" text,
	"message_type" text DEFAULT 'text',
	"status" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"exam_type" text DEFAULT 'mppolice' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"category" text DEFAULT 'general',
	"message" text NOT NULL,
	"status" text DEFAULT 'open',
	"created_at" timestamp with time zone DEFAULT now(),
	"exam_type" text DEFAULT 'mppolice' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "syllabus_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"unit_id" text NOT NULL,
	"title" text NOT NULL,
	"title_en" text,
	"content" jsonb NOT NULL,
	"content_en" jsonb,
	"ai_content" jsonb,
	"ai_content_en" jsonb,
	"order" integer NOT NULL,
	"is_free" boolean DEFAULT false,
	"is_lite_access" boolean DEFAULT false,
	"is_pro_access" boolean DEFAULT true,
	"img_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"exam_type" text DEFAULT 'mppolice' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_attempt_limits" (
	"test_type" text PRIMARY KEY NOT NULL,
	"max_attempts" integer
);
--> statement-breakpoint
CREATE TABLE "test_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"user_id" text,
	"test_type" text NOT NULL,
	"test_name" text,
	"overall_rating" integer NOT NULL,
	"difficulty_level" text NOT NULL,
	"question_quality" text NOT NULL,
	"would_recommend" text NOT NULL,
	"comments" text,
	"user_name" text,
	"user_email" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"exam_type" text DEFAULT 'mppolice' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_leaderboard" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"user_id" text,
	"display_name" text NOT NULL,
	"score" double precision NOT NULL,
	"percentage" double precision,
	"time_taken_seconds" integer,
	"rank" integer,
	"is_fake" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"title_en" text,
	"description" text,
	"slug" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"total_questions" integer DEFAULT 0,
	"total_marks" integer NOT NULL,
	"type" text NOT NULL,
	"unit_id" text,
	"topic_id" text,
	"tags" jsonb,
	"is_pro" boolean DEFAULT false,
	"is_free_access" boolean DEFAULT false,
	"is_lite_access" boolean DEFAULT false,
	"is_pro_access" boolean DEFAULT true,
	"is_instant_mode" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"is_hidden" boolean DEFAULT false,
	"max_retries" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"cutoffs" jsonb,
	"exam_type" text DEFAULT 'mppolice' NOT NULL,
	CONSTRAINT "tests_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topic_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"unit_id" text NOT NULL,
	"revision_count" integer DEFAULT 0,
	"last_revised_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"test_id" text NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"score" double precision,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"exam_type" text DEFAULT 'mppolice' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_user_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."user_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "free_quiz_attempts" ADD CONSTRAINT "free_quiz_attempts_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mppolice_one_liner_revisions" ADD CONSTRAINT "mppolice_one_liner_revisions_user_id_mppsc_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mppsc_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mppolice_one_liner_revisions" ADD CONSTRAINT "mppolice_one_liner_revisions_fact_id_mppolice_one_liner_facts_id_fk" FOREIGN KEY ("fact_id") REFERENCES "public"."mppolice_one_liner_facts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_mppsc_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mppsc_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pyq_fact_bank" ADD CONSTRAINT "pyq_fact_bank_topic_id_pyq_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."pyq_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pyq_question_topics" ADD CONSTRAINT "pyq_question_topics_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pyq_question_topics" ADD CONSTRAINT "pyq_question_topics_topic_id_pyq_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."pyq_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pyq_repeated_cache" ADD CONSTRAINT "pyq_repeated_cache_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pyq_topic_trends" ADD CONSTRAINT "pyq_topic_trends_topic_id_pyq_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."pyq_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_conversations" ADD CONSTRAINT "support_conversations_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_conversation_id_support_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_revisions" ADD CONSTRAINT "topic_revisions_user_id_mppsc_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mppsc_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_attempts" ADD CONSTRAINT "user_attempts_user_id_mppsc_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mppsc_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_attempts" ADD CONSTRAINT "user_attempts_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempt_id_idx" ON "attempt_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "question_id_idx" ON "attempt_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_attempt_question" ON "attempt_answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "idx_feedbacks_created_at" ON "feedbacks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_feedbacks_category" ON "feedbacks" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_feedbacks_role" ON "feedbacks" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_free_attempts_test" ON "free_quiz_attempts" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "idx_free_attempts_guest" ON "free_quiz_attempts" USING btree ("guest_id");--> statement-breakpoint
CREATE INDEX "idx_guests_email" ON "guests" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_guests_mobile_unique" ON "guests" USING btree ("mobile");--> statement-breakpoint
CREATE INDEX "idx_mppol_ol_subject_status" ON "mppolice_one_liner_facts" USING btree ("subject_tag","status");--> statement-breakpoint
CREATE INDEX "idx_mppol_ol_importance" ON "mppolice_one_liner_facts" USING btree ("status","importance_score");--> statement-breakpoint
CREATE INDEX "idx_mppol_rel_user" ON "mppolice_one_liner_revisions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mppol_rel_fact" ON "mppolice_one_liner_revisions" USING btree ("fact_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_mppol_rel_user_fact" ON "mppolice_one_liner_revisions" USING btree ("user_id","fact_id");--> statement-breakpoint
CREATE INDEX "idx_activities_user_id" ON "mppsc_user_activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_activities_action" ON "mppsc_user_activities" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_activities_created_at" ON "mppsc_user_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "mppsc_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_payments_order_id" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_payments_user_id" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_payment_id" ON "payments" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "idx_pyq_jobs_status_created" ON "pyq_content_import_jobs" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_fact_topic_status" ON "pyq_fact_bank" USING btree ("topic_id","status");--> statement-breakpoint
CREATE INDEX "idx_fact_subject_status" ON "pyq_fact_bank" USING btree ("subject","status");--> statement-breakpoint
CREATE INDEX "idx_fact_importance" ON "pyq_fact_bank" USING btree ("status","importance_score");--> statement-breakpoint
CREATE UNIQUE INDEX "pyq_qt_question_topic_unique" ON "pyq_question_topics" USING btree ("question_id","topic_id");--> statement-breakpoint
CREATE INDEX "idx_pyq_qt_topic" ON "pyq_question_topics" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "idx_pyq_qt_question" ON "pyq_question_topics" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_pyq_qt_primary" ON "pyq_question_topics" USING btree ("topic_id","is_primary");--> statement-breakpoint
CREATE INDEX "idx_pyq_repeated_cluster" ON "pyq_repeated_cache" USING btree ("cluster_id");--> statement-breakpoint
CREATE INDEX "idx_pyq_repeated_unit" ON "pyq_repeated_cache" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "idx_pyq_repeated_count" ON "pyq_repeated_cache" USING btree ("repeat_count");--> statement-breakpoint
CREATE UNIQUE INDEX "pyq_trends_topic_year_unique" ON "pyq_topic_trends" USING btree ("topic_id","year");--> statement-breakpoint
CREATE INDEX "idx_trends_subject_year" ON "pyq_topic_trends" USING btree ("subject","year");--> statement-breakpoint
CREATE INDEX "idx_trends_topic_year" ON "pyq_topic_trends" USING btree ("topic_id","year");--> statement-breakpoint
CREATE UNIQUE INDEX "pyq_topics_topic_slug_unique" ON "pyq_topics" USING btree ("topic_slug");--> statement-breakpoint
CREATE INDEX "idx_pyq_topics_subject" ON "pyq_topics" USING btree ("subject","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "pyq_unit_cache_year_unit_unique" ON "pyq_unit_cache" USING btree ("year","unit_id");--> statement-breakpoint
CREATE INDEX "idx_pyq_unit_cache_year" ON "pyq_unit_cache" USING btree ("year");--> statement-breakpoint
CREATE INDEX "idx_questions_subject" ON "questions" USING btree ("test_id","subject");--> statement-breakpoint
CREATE INDEX "idx_support_conv_guest_phone" ON "support_conversations" USING btree ("guest_phone");--> statement-breakpoint
CREATE INDEX "idx_support_conv_last_msg" ON "support_conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "idx_support_conv_exam_type" ON "support_conversations" USING btree ("exam_type");--> statement-breakpoint
CREATE INDEX "idx_support_msg_conv_id" ON "support_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_support_msg_created_at" ON "support_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_support_msg_exam_type" ON "support_messages" USING btree ("exam_type");--> statement-breakpoint
CREATE INDEX "unit_order_idx" ON "syllabus_topics" USING btree ("unit_id","order");--> statement-breakpoint
CREATE INDEX "test_score_idx" ON "test_leaderboard" USING btree ("test_id","score");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_ranking" ON "test_leaderboard" USING btree ("test_id","score","time_taken_seconds");--> statement-breakpoint
CREATE INDEX "idx_tests_slug" ON "tests" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_tests_type_ispro" ON "tests" USING btree ("type","is_pro");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "user_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "test_id_idx" ON "user_attempts" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "user_test_idx" ON "user_attempts" USING btree ("user_id","test_id");--> statement-breakpoint
CREATE INDEX "completed_idx" ON "user_attempts" USING btree ("is_completed","end_time");--> statement-breakpoint
CREATE INDEX "idx_user_test_completed" ON "user_attempts" USING btree ("user_id","test_id","is_completed","end_time");--> statement-breakpoint
CREATE INDEX "idx_attempts_by_date" ON "user_attempts" USING btree ("user_id","end_time");--> statement-breakpoint
CREATE INDEX "idx_user_attempts_completion_score" ON "user_attempts" USING btree ("user_id","is_completed","score");--> statement-breakpoint
CREATE INDEX "idx_verification_tokens_identifier" ON "verification_tokens" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "idx_verification_tokens_token" ON "verification_tokens" USING btree ("token");