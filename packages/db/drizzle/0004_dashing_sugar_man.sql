CREATE TYPE "public"."feed_activity_type" AS ENUM('LOG', 'REVIEW', 'FOLLOW');--> statement-breakpoint
CREATE TABLE "feed_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"type" "feed_activity_type" NOT NULL,
	"source_id" text NOT NULL,
	"media_id" integer,
	"media_type" "media_type",
	"target_user_id" text,
	"snapshot" jsonb NOT NULL,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feed_activities" ADD CONSTRAINT "feed_activities_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_activities" ADD CONSTRAINT "feed_activities_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "feed_activities_actor_source_unique_idx" ON "feed_activities" USING btree ("actor_id","type","source_id");--> statement-breakpoint
CREATE INDEX "feed_activities_occurred_idx" ON "feed_activities" USING btree ("occurred_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "feed_activities_actor_occurred_idx" ON "feed_activities" USING btree ("actor_id","occurred_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "feed_activities_target_user_idx" ON "feed_activities" USING btree ("target_user_id");