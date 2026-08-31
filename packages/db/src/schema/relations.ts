import { relations } from "drizzle-orm";

import {
  account,
  activity,
  library,
  media,
  progress,
  reviews,
  session,
  user,
  social,
  profile,
} from "./tables";

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  library: many(library),
  progress: many(progress),
  activity: many(activity, { relationName: "activityActor" }),
  reviews: many(reviews),
  followers: many(social, { relationName: "following" }),
  following: many(social, { relationName: "follower" }),
  profile: one(profile, {
    fields: [user.id],
    references: [profile.userId],
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(user, { fields: [progress.userId], references: [user.id] }),
}));

export const activityRelations = relations(activity, ({ one }) => ({
  actor: one(user, {
    fields: [activity.actorId],
    references: [user.id],
    relationName: "activityActor",
  }),
  media: one(media, { fields: [activity.mediaId], references: [media.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, { fields: [profile.userId], references: [user.id] }),
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
  library: many(library),
  reviews: many(reviews),
  activity: many(activity),
}));

export const libraryRelations = relations(library, ({ one }) => ({
  user: one(user, { fields: [library.userId], references: [user.id] }),
  media: one(media, { fields: [library.mediaId], references: [media.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(user, { fields: [reviews.userId], references: [user.id] }),
  media: one(media, { fields: [reviews.mediaId], references: [media.id] }),
}));
