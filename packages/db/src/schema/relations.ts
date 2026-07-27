import { relations } from "drizzle-orm";

import { account, libraryEntries, media, reviews, session, user, userProfile } from "./tables";

// Relations live outside ./tables so the table files form a plain acyclic graph
// (library/reviews → media → enums) instead of importing each other.
//
// The media links join on mediaId alone: media.id is globally unique, and the
// composite foreign keys already pin mediaType to the matching row.

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  libraryEntries: many(libraryEntries),
  reviews: many(reviews),
  profile: one(userProfile, {
    fields: [user.id],
    references: [userProfile.userId],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, { fields: [userProfile.userId], references: [user.id] }),
}));

export const mediaRelations = relations(media, ({ many }) => ({
  libraryEntries: many(libraryEntries),
  reviews: many(reviews),
}));

export const libraryEntriesRelations = relations(libraryEntries, ({ one }) => ({
  user: one(user, { fields: [libraryEntries.userId], references: [user.id] }),
  media: one(media, { fields: [libraryEntries.mediaId], references: [media.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(user, { fields: [reviews.userId], references: [user.id] }),
  media: one(media, { fields: [reviews.mediaId], references: [media.id] }),
}));
