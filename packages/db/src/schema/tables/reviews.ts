import {
  pgTable,
  text,
  timestamp,
  integer,
  foreignKey,
  index,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import type { RichContent } from "@tsuki/rich-content";

import { user } from "./auth";
import { media } from "./media";
import { mediaTypeEnum } from "../enums";

/** One review per user per media, anime or manga alike. */
export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mediaId: integer("media_id").notNull(),
    /** Denormalised from media.type — kept honest by the composite FK below. */
    mediaType: mediaTypeEnum("media_type").notNull(),
    /** Rich Content document (review preset); spoilers live inside the document. */
    content: jsonb("content").$type<RichContent>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.mediaId, table.mediaType],
      foreignColumns: [media.id, media.type],
      name: "reviews_media_fk",
    }).onDelete("cascade"),
    uniqueIndex("reviews_user_media_unique_idx").on(table.userId, table.mediaId),
    index("reviews_user_type_created_idx").on(
      table.userId,
      table.mediaType,
      table.createdAt.desc(),
    ),
    index("reviews_media_idx").on(table.mediaId),
  ],
);
