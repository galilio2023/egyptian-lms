CREATE TABLE "lesson_checkpoint_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" uuid NOT NULL,
	"checkpoint_id" text NOT NULL,
	"xp_awarded" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson" ADD COLUMN "checkpoints" jsonb;--> statement-breakpoint
ALTER TABLE "lesson_checkpoint_progress" ADD CONSTRAINT "lesson_checkpoint_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_checkpoint_progress" ADD CONSTRAINT "lesson_checkpoint_progress_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lesson_checkpoint_progress_user_id_idx" ON "lesson_checkpoint_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lesson_checkpoint_progress_lesson_id_idx" ON "lesson_checkpoint_progress" USING btree ("lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_checkpoint_progress_user_checkpoint_unique_idx" ON "lesson_checkpoint_progress" USING btree ("user_id","lesson_id","checkpoint_id");