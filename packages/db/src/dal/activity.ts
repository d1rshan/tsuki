import { asc, eq } from "drizzle-orm";

import { db } from "../db";
import { progressActivity } from "../schema";

export const getProgressActivity = async (userId: string) => {
  return db
    .select({
      date: progressActivity.activityDate,
      mediaType: progressActivity.mediaType,
      amount: progressActivity.amount,
    })
    .from(progressActivity)
    .where(eq(progressActivity.userId, userId))
    .orderBy(asc(progressActivity.activityDate));
};
