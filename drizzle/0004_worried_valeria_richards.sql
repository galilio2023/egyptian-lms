ALTER TABLE "platform_settings" ADD COLUMN "enable_hero_toys" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "enable_hero_phonics_strip" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "enable_mascot_cards" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "theme_vibe" text DEFAULT 'playful_kids' NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "toy_squad" text DEFAULT 'all_toys' NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "accent_color_palette" text DEFAULT 'purple' NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "background_style" text DEFAULT 'default_gradient' NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "custom_background_url" text;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD COLUMN "card_vibe_style" text DEFAULT 'cartoon_playful' NOT NULL;