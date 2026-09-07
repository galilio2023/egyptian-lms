CREATE TYPE "public"."audit_event_type" AS ENUM('voucher_redeem_success', 'voucher_redeem_failed', 'voucher_rate_limited', 'device_locked', 'device_transferred', 'device_transfer_failed', 'quiz_max_attempts_blocked', 'rate_limit_triggered', 'unauthorized_portal_access', 'live_session_attended', 'user_banned');--> statement-breakpoint
CREATE TYPE "public"."audit_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "live_session_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"academy_name_arabic" text DEFAULT 'أكاديمية إيليت' NOT NULL,
	"academy_name_english" text DEFAULT 'Elite Academy' NOT NULL,
	"teacher_name_arabic" text DEFAULT 'المعلم المشرف' NOT NULL,
	"teacher_name_english" text DEFAULT 'Lead Instructor' NOT NULL,
	"teacher_title" text DEFAULT 'المشرف الأكاديمي وكبير المعلمين',
	"teacher_bio" text,
	"whatsapp_number" text DEFAULT '201000000000' NOT NULL,
	"hotline_number" text DEFAULT '0225006000' NOT NULL,
	"inquiries_number" text DEFAULT '01100000000' NOT NULL,
	"vodafone_cash_number" text DEFAULT '01000000000',
	"instapay_address" text DEFAULT 'academy@instapay',
	"hero_video_url" text DEFAULT 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' NOT NULL,
	"sample_lectures" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" "audit_event_type" NOT NULL,
	"severity" "audit_severity" DEFAULT 'low' NOT NULL,
	"user_id" text,
	"student_phone" text,
	"ip_address" text,
	"user_agent" text,
	"description" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "homework_submission" ADD COLUMN "audio_voice_note_url" text;--> statement-breakpoint
ALTER TABLE "lesson" ADD COLUMN "prerequisite_type" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson" ADD COLUMN "prerequisite_lesson_id" uuid;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "quiz" ADD COLUMN "pool_size" integer;--> statement-breakpoint
ALTER TABLE "live_session_attendance" ADD CONSTRAINT "live_session_attendance_session_id_live_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."live_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_session_attendance" ADD CONSTRAINT "live_session_attendance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_audit_log" ADD CONSTRAINT "security_audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "live_attendance_session_id_idx" ON "live_session_attendance" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "live_attendance_user_id_idx" ON "live_session_attendance" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "live_attendance_session_user_idx" ON "live_session_attendance" USING btree ("session_id","user_id");--> statement-breakpoint
CREATE INDEX "audit_event_type_idx" ON "security_audit_log" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "audit_user_id_idx" ON "security_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_created_at_idx" ON "security_audit_log" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_prerequisite_lesson_id_lesson_id_fk" FOREIGN KEY ("prerequisite_lesson_id") REFERENCES "public"."lesson"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_unit_id_idx" ON "order" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "order_idempotency_key_idx" ON "order" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "order_reference_number_idx" ON "order" USING btree ("reference_number");--> statement-breakpoint
CREATE INDEX "order_payment_status_idx" ON "order" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "order_created_at_idx" ON "order" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "quiz_unit_id_idx" ON "quiz" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "quiz_lesson_id_idx" ON "quiz" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "quiz_question_quiz_id_idx" ON "quiz_question" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "voucher_redeemed_idx" ON "voucher_code" USING btree ("is_redeemed","code");--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_idempotency_key_unique" UNIQUE("idempotency_key");