import { and, asc, eq, gte, sql, sum } from "drizzle-orm";

import { db } from "../db";
import { progressActivity } from "../schema";

export const getProgressActivity = async (userId: string, since: Date) => {
  const date = sql<string>`to_char(${progressActivity.createdAt}, 'YYYY-MM-DD')`;

  return db
    .select({
      date,
      mediaType: progressActivity.mediaType,
      amount: sum(progressActivity.amount).mapWith(Number),
    })
    .from(progressActivity)
    .where(and(eq(progressActivity.userId, userId), gte(progressActivity.createdAt, since)))
    .groupBy(date, progressActivity.mediaType)
    .orderBy(asc(date));
};

export type ProgressActivityRow = Awaited<ReturnType<typeof getProgressActivity>>[number];
