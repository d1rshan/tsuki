import { pgTable, timestamp, jsonb, text } from "drizzle-orm/pg-core";

import type { RichContent } from "@tsuki/rich-content";

import { user } from "./auth";

export const profile = pgTable("profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  /** Rich Content document (bio preset); null when the author wrote nothing. */
  bio: jsonb("bio").$type<RichContent>(),
  bannerImage: text("banner_image"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
