import { asc, eq } from "drizzle-orm";

import { db } from "../db";
import { progressActivity } from "../schema";

/**
 * Rows are stored by the progress trigger defined in
 * `drizzle/0001_record_progress_activity.sql` whenever library progress increases.
 */
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
