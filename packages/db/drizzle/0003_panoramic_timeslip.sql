CREATE TABLE "social" (
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "social_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id"),
	CONSTRAINT "social_no_self_follow" CHECK ("social"."follower_id" <> "social"."following_id")
);
--> statement-breakpoint
ALTER TABLE "social" ADD CONSTRAINT "social_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social" ADD CONSTRAINT "social_following_id_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "social_follower_created_idx" ON "social" USING btree ("follower_id","created_at" DESC NULLS LAST,"following_id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "social_following_created_idx" ON "social" USING btree ("following_id","created_at" DESC NULLS LAST,"follower_id" DESC NULLS LAST);