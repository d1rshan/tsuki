import { relations } from "drizzle-orm";

import {
  account,
  libraryEntries,
  media,
  reviews,
  session,
  user,
  userFollows,
  userProfile,
} from "./tables";

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  libraryEntries: many(libraryEntries),
  reviews: many(reviews),
  followers: many(userFollows, { relationName: "following" }),
  following: many(userFollows, { relationName: "follower" }),
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

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(user, {
    fields: [userFollows.followerId],
    references: [user.id],
    relationName: "follower",
  }),
  following: one(user, {
    fields: [userFollows.followingId],
    references: [user.id],
    relationName: "following",
  }),
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
