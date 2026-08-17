CREATE TYPE "public"."list_status" AS ENUM('CURRENT', 'PLANNING', 'COMPLETED', 'DROPPED', 'PAUSED', 'REPEATING');--> statement-breakpoint
CREATE TYPE "public"."media_format" AS ENUM('TV', 'TV_SHORT', 'MOVIE', 'SPECIAL', 'OVA', 'ONA', 'MUSIC', 'MANGA', 'NOVEL', 'ONE_SHOT');--> statement-breakpoint
CREATE TYPE "public"."media_season" AS ENUM('WINTER', 'SPRING', 'SUMMER', 'FALL');--> statement-breakpoint
CREATE TYPE "public"."media_source" AS ENUM('ORIGINAL', 'MANGA', 'LIGHT_NOVEL', 'VISUAL_NOVEL', 'VIDEO_GAME', 'OTHER', 'NOVEL', 'DOUJINSHI', 'ANIME', 'WEB_NOVEL', 'LIVE_ACTION', 'GAME', 'COMIC', 'MULTIMEDIA_PROJECT', 'PICTURE_BOOK');--> statement-breakpoint
CREATE TYPE "public"."media_status" AS ENUM('FINISHED', 'RELEASING', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('ANIME', 'MANGA');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
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
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text NOT NULL,
	"display_username" text NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
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
CREATE TABLE "progress_activity" (
	"user_id" text NOT NULL,
	"media_type" "media_type" NOT NULL,
	"activity_date" date DEFAULT (now() at time zone 'UTC')::date NOT NULL,
	"amount" integer NOT NULL,
	CONSTRAINT "progress_activity_user_id_media_type_activity_date_pk" PRIMARY KEY("user_id","media_type","activity_date"),
	CONSTRAINT "progress_activity_amount_positive" CHECK ("progress_activity"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"bio" text,
	"banner_image" text,
	"accent_color" text,
	"social_links" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" integer PRIMARY KEY NOT NULL,
	"type" "media_type" NOT NULL,
	"title_romaji" text,
	"title_english" text,
	"title_native" text,
	"description" text,
	"cover_image_extra_large" text,
	"cover_image_large" text,
	"cover_image_color" text,
	"banner_image" text,
	"format" "media_format",
	"status" "media_status",
	"source" "media_source",
	"country_of_origin" text,
	"episodes" integer,
	"duration" integer,
	"chapters" integer,
	"volumes" integer,
	"start_date" jsonb,
	"end_date" jsonb,
	"season" "media_season",
	"season_year" integer,
	"average_score" integer,
	"popularity" integer,
	"favourites" integer,
	"genres" jsonb,
	"trailer" jsonb,
	"external_links" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_id_type_unique" UNIQUE("id","type")
);
--> statement-breakpoint
CREATE TABLE "library_entries" (
	"user_id" text NOT NULL,
	"media_id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"status" "list_status",
	"score" integer,
	"progress" integer DEFAULT 0 NOT NULL,
	"progress_volumes" integer,
	"repeat" integer DEFAULT 0 NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"notes" text,
	"started_at" jsonb,
	"completed_at" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "library_entries_user_id_media_id_pk" PRIMARY KEY("user_id","media_id"),
	CONSTRAINT "library_entries_score_range" CHECK ("library_entries"."score" BETWEEN 1 AND 10)
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"media_id" integer NOT NULL,
	"media_type" "media_type" NOT NULL,
	"content" text NOT NULL,
	"contains_spoilers" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_activity" ADD CONSTRAINT "progress_activity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_entries" ADD CONSTRAINT "library_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_entries" ADD CONSTRAINT "library_entries_media_fk" FOREIGN KEY ("media_id","media_type") REFERENCES "public"."media"("id","type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_media_fk" FOREIGN KEY ("media_id","media_type") REFERENCES "public"."media"("id","type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "media_type_popularity_idx" ON "media" USING btree ("type","popularity");--> statement-breakpoint
CREATE INDEX "library_entries_user_type_updated_idx" ON "library_entries" USING btree ("user_id","media_type","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "library_entries_media_idx" ON "library_entries" USING btree ("media_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_user_media_unique_idx" ON "reviews" USING btree ("user_id","media_id");--> statement-breakpoint
CREATE INDEX "reviews_user_type_created_idx" ON "reviews" USING btree ("user_id","media_type","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "reviews_media_idx" ON "reviews" USING btree ("media_id");