ALTER TYPE "public"."audit_event_type" ADD VALUE 'video_encoding_ready';--> statement-breakpoint
ALTER TYPE "public"."audit_event_type" ADD VALUE 'video_encoding_failed';--> statement-breakpoint
DROP INDEX "enrollment_user_id_idx";--> statement-breakpoint
DROP INDEX "lesson_unit_id_idx";--> statement-breakpoint
DROP INDEX "lesson_checkpoint_progress_user_id_idx";--> statement-breakpoint
DROP INDEX "lesson_progress_user_id_idx";--> statement-breakpoint
DROP INDEX "live_attendance_session_id_idx";--> statement-breakpoint
DROP INDEX "order_payment_status_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "course_unit_slug_unique_idx" ON "course_unit" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "course_unit_published_order_idx" ON "course_unit" USING btree ("is_published","order_index");--> statement-breakpoint
CREATE INDEX "enrollment_active_check_idx" ON "enrollment" USING btree ("user_id","unit_id","is_active");--> statement-breakpoint
CREATE INDEX "hw_sub_assignment_status_idx" ON "homework_submission" USING btree ("assignment_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_slug_unique_idx" ON "lesson" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "lesson_unit_order_idx" ON "lesson" USING btree ("unit_id","order_index");--> statement-breakpoint
CREATE INDEX "order_receipt_hash_idx" ON "order" USING btree ("receipt_hash");--> statement-breakpoint
CREATE INDEX "order_status_created_idx" ON "order" USING btree ("payment_status","created_at");--> statement-breakpoint
CREATE INDEX "quiz_attempt_user_quiz_idx" ON "quiz_attempt" USING btree ("user_id","quiz_id");--> statement-breakpoint
CREATE INDEX "audit_event_created_idx" ON "security_audit_log" USING btree ("event_type","created_at");--> statement-breakpoint
CREATE INDEX "student_profile_xp_points_idx" ON "student_profile" USING btree ("xp_points");--> statement-breakpoint
CREATE INDEX "student_profile_grade_level_idx" ON "student_profile" USING btree ("grade_level");