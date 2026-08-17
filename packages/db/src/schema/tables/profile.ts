import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

import { user } from "./auth";

export type Theme =
  | "dark"
  | "light"
  | "sakura"
  | "ocean"
  | "forest"
  | "sunset"
  | "lavender"
  | "rose"
  | "mint"
  | "amber"
  | "nord"
  | "dracula"
  | "coffee"
  | "cyberpunk"
  | "midnight";

export const userProfile = pgTable("user_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio"),
  bannerImage: text("banner_image"),
  theme: text("theme").$type<Theme>(),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
