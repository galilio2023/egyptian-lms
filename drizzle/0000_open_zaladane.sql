CREATE TYPE "public"."governorate" AS ENUM('cairo', 'giza', 'alexandria', 'dakahlia', 'red_sea', 'beheira', 'fayoum', 'gharbiya', 'ismailia', 'menofia', 'minya', 'qaliubiya', 'new_valley', 'suez', 'aswan', 'assiut', 'beni_suef', 'port_said', 'damietta', 'sharkia', 'south_sinai', 'kafr_el_sheikh', 'matrouh', 'luxor', 'qena', 'north_sinai', 'sohag');--> statement-breakpoint
CREATE TYPE "public"."homework_status" AS ENUM('submitted', 'in_review', 'graded', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('paymob_card', 'paymob_wallet', 'fawry', 'instapay_manual', 'wallet_manual');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded', 'manual_review');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'parent', 'assistant', 'teacher', 'admin');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_unit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grade_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"price_egp" integer DEFAULT 250 NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"unit_id" uuid NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grade" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_arabic" text NOT NULL,
	"title_english" text NOT NULL,
	"slug" text NOT NULL,
	"grade_number" integer NOT NULL,
	"badge_color" text DEFAULT '#4f46e5',
	"order_index" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "grade_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "homework_assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"lesson_id" uuid,
	"title" text NOT NULL,
	"instructions" text,
	"page_number" text,
	"max_score" integer DEFAULT 10 NOT NULL,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homework_submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"student_images" jsonb NOT NULL,
	"status" "homework_status" DEFAULT 'submitted' NOT NULL,
	"score" integer,
	"feedback_notes" text,
	"annotated_images" jsonb,
	"graded_by_user_id" text,
	"graded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"video_provider" text DEFAULT 'bunny' NOT NULL,
	"video_id" text NOT NULL,
	"video_duration_seconds" integer DEFAULT 1200,
	"pdf_attachment_url" text,
	"is_free_preview" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grade_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"scheduled_at" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"provider" text DEFAULT 'zoom' NOT NULL,
	"meeting_url" text NOT NULL,
	"meeting_password" text,
	"is_live_now" boolean DEFAULT false NOT NULL,
	"recording_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"unit_id" uuid NOT NULL,
	"amount_egp" integer NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"gateway_order_id" text,
	"gateway_transaction_id" text,
	"receipt_image_url" text,
	"reference_number" text,
	"reviewer_notes" text,
	"receipt_hash" text,
	"ocr_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_gateway_order_id_unique" UNIQUE("gateway_order_id"),
	CONSTRAINT "order_gateway_transaction_id_unique" UNIQUE("gateway_transaction_id")
);
--> statement-breakpoint
CREATE TABLE "quiz" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid,
	"unit_id" uuid,
	"title" text NOT NULL,
	"time_limit_minutes" integer DEFAULT 15 NOT NULL,
	"pass_percentage" integer DEFAULT 60 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"score" integer NOT NULL,
	"total_possible_score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"time_spent_seconds" integer NOT NULL,
	"user_answers" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"question_audio_url" text,
	"question_image_url" text,
	"question_type" text DEFAULT 'multiple_choice' NOT NULL,
	"options" jsonb NOT NULL,
	"explanation" text,
	"points" integer DEFAULT 1 NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"device_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "student_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"parent_phone_number" text NOT NULL,
	"parent_name" text,
	"governorate" "governorate" DEFAULT 'cairo' NOT NULL,
	"grade_level" integer DEFAULT 1 NOT NULL,
	"school_name" text,
	"xp_points" integer DEFAULT 0 NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone_number" text NOT NULL,
	"email" text,
	"email_verified" boolean DEFAULT false,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"unit_id" uuid NOT NULL,
	"is_redeemed" boolean DEFAULT false NOT NULL,
	"redeemed_by_user_id" text,
	"redeemed_at" timestamp,
	"batch_name" text DEFAULT 'دفعة سناتر أكتوبر 2026',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voucher_code_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_unit" ADD CONSTRAINT "course_unit_grade_id_grade_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grade"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_unit_id_course_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."course_unit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_assignment" ADD CONSTRAINT "homework_assignment_unit_id_course_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."course_unit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_assignment" ADD CONSTRAINT "homework_assignment_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_submission" ADD CONSTRAINT "homework_submission_assignment_id_homework_assignment_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."homework_assignment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_submission" ADD CONSTRAINT "homework_submission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homework_submission" ADD CONSTRAINT "homework_submission_graded_by_user_id_user_id_fk" FOREIGN KEY ("graded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_unit_id_course_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."course_unit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_session" ADD CONSTRAINT "live_session_grade_id_grade_id_fk" FOREIGN KEY ("grade_id") REFERENCES "public"."grade"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_unit_id_course_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."course_unit"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_unit_id_course_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."course_unit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_question" ADD CONSTRAINT "quiz_question_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_code" ADD CONSTRAINT "voucher_code_unit_id_course_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."course_unit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_code" ADD CONSTRAINT "voucher_code_redeemed_by_user_id_user_id_fk" FOREIGN KEY ("redeemed_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_unit_grade_id_idx" ON "course_unit" USING btree ("grade_id");--> statement-breakpoint
CREATE INDEX "enrollment_user_id_idx" ON "enrollment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "enrollment_unit_id_idx" ON "enrollment" USING btree ("unit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollment_user_unit_unique_idx" ON "enrollment" USING btree ("user_id","unit_id");--> statement-breakpoint
CREATE INDEX "homework_assignment_unit_id_idx" ON "homework_assignment" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "hw_sub_user_id_idx" ON "homework_submission" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "hw_sub_assignment_id_idx" ON "homework_submission" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "lesson_unit_id_idx" ON "lesson" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "live_session_grade_id_idx" ON "live_session" USING btree ("grade_id");--> statement-breakpoint
CREATE INDEX "order_user_id_idx" ON "order" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quiz_attempt_user_id_idx" ON "quiz_attempt" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quiz_attempt_quiz_id_idx" ON "quiz_attempt" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "voucher_code_idx" ON "voucher_code" USING btree ("code");--> statement-breakpoint
CREATE INDEX "voucher_unit_id_idx" ON "voucher_code" USING btree ("unit_id");