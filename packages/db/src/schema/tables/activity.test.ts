import { describe, expect, test } from "bun:test";
import { getTableConfig } from "drizzle-orm/pg-core";

import { progressActivity } from "./activity";
import { libraryEntries } from "./library";

describe("progress activity table", () => {
  test("stores only positive increments and removes them with the user", () => {
    const config = getTableConfig(progressActivity);

    expect(config.checks.map((constraint) => constraint.name)).toContain(
      "progress_activity_amount_positive",
    );
    expect(config.foreignKeys[0]?.onDelete).toBe("cascade");
  });

  test("indexes a user's activity by time", () => {
    const config = getTableConfig(progressActivity);
    const activityIndex = config.indexes.find(
      (dbIndex) => dbIndex.config.name === "progress_activity_user_created_idx",
    );

    expect(activityIndex?.config.columns.map((column) => column.name)).toEqual([
      "user_id",
      "created_at",
    ]);
  });

  test("leaves existing progress unaccounted until its next write", () => {
    const cursor = getTableConfig(libraryEntries).columns.find(
      (column) => column.name === "activity_progress",
    );

    expect(cursor?.notNull).toBe(false);
    expect(cursor?.default).toBeUndefined();
  });
});
