import { relations } from "drizzle-orm";

import {
  account,
  feedActivities,
  libraryEntries,
  media,
  progressActivity,
  reviews,
  session,
  user,
  social,
  userProfile,
} from "./tables";

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  libraryEntries: many(libraryEntries),
  progressActivity: many(progressActivity),
  feedActivities: many(feedActivities, { relationName: "activityActor" }),
  reviews: many(reviews),
  followers: many(social, { relationName: "following" }),
  following: many(social, { relationName: "follower" }),
  profile: one(userProfile, {
    fields: [user.id],
    references: [userProfile.userId],
  }),
}));

export const progressActivityRelations = relations(progressActivity, ({ one }) => ({
  user: one(user, { fields: [progressActivity.userId], references: [user.id] }),
}));

export const feedActivityRelations = relations(feedActivities, ({ one }) => ({
  actor: one(user, {
    fields: [feedActivities.actorId],
    references: [user.id],
    relationName: "activityActor",
  }),
  media: one(media, { fields: [feedActivities.mediaId], references: [media.id] }),
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

export const socialRelations = relations(social, ({ one }) => ({
  follower: one(user, {
    fields: [social.followerId],
    references: [user.id],
    relationName: "follower",
  }),
  following: one(user, {
    fields: [social.followingId],
    references: [user.id],
    relationName: "following",
  }),
}));

export const mediaRelations = relations(media, ({ many }) => ({
  libraryEntries: many(libraryEntries),
  reviews: many(reviews),
  feedActivities: many(feedActivities),
}));

export const libraryEntriesRelations = relations(libraryEntries, ({ one }) => ({
  user: one(user, { fields: [libraryEntries.userId], references: [user.id] }),
  media: one(media, { fields: [libraryEntries.mediaId], references: [media.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(user, { fields: [reviews.userId], references: [user.id] }),
  media: one(media, { fields: [reviews.mediaId], references: [media.id] }),
}));
