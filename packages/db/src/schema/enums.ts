import { pgEnum } from "drizzle-orm/pg-core";

// SHARED ENUMS

export const mediaStatusEnum = pgEnum("media_status", [
  "FINISHED",
  "RELEASING",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
]);

export const watchStatusEnum = pgEnum("watch_status", [
  "WATCHING",
  "COMPLETED",
  "PLAN_TO_WATCH",
  "DROPPED",
  "PAUSED",
]);

export const readStatusEnum = pgEnum("read_status", [
  "READING",
  "COMPLETED",
  "PLAN_TO_READ",
  "DROPPED",
  "PAUSED",
]);
