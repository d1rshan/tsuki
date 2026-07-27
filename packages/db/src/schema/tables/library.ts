import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
  foreignKey,
  index,
  check,
} from "drizzle-orm/pg-core";

import type { FuzzyDate } from "../types";
import { listStatusEnum, mediaTypeEnum } from "../enums";
import { user } from "./auth";
import { media } from "./media";

/**
 * A user's entry for one media, anime or manga alike. Modelled on AniList's
 * `MediaList`: `progress` counts episodes watched or chapters read, and
 * `status` uses their type-agnostic vocabulary.
 */
export const libraryEntries = pgTable(
  "library_entries",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mediaId: integer("media_id").notNull(),
    /** Denormalised from media.type — kept honest by the composite FK below. */
    mediaType: mediaTypeEnum("media_type").notNull(),
    status: listStatusEnum("status"),
    score: integer("score"),
    /** Episodes watched or chapters read. */
    progress: integer("progress").default(0).notNull(),
    /** Manga only. */
    progressVolumes: integer("progress_volumes"),
    /** Rewatch/reread count, pairs with status REPEATING. */
    repeat: integer("repeat").default(0).notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    notes: text("notes"),
    startedAt: jsonb("started_at").$type<FuzzyDate>(),
    completedAt: jsonb("completed_at").$type<FuzzyDate>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.mediaId] }),
    // Guarantees mediaType matches the referenced media row, so filtering by
    // type never needs a join.
    foreignKey({
      columns: [table.mediaId, table.mediaType],
      foreignColumns: [media.id, media.type],
      name: "library_entries_media_fk",
    }).onDelete("cascade"),
    index("library_entries_user_type_updated_idx").on(
      table.userId,
      table.mediaType,
      table.updatedAt.desc(),
    ),
    index("library_entries_media_idx").on(table.mediaId),
    check("library_entries_score_range", sql`${table.score} BETWEEN 1 AND 10`), // TODO: we moved from rating to score to reflect anilist but we gave limit of 1-10 (fyi)
  ],
);
