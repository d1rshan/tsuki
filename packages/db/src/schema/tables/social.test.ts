import { describe, expect, test } from "bun:test";
import { getTableConfig } from "drizzle-orm/pg-core";

import { userFollows } from "./social";

describe("user follows table", () => {
  test("enforces directed uniqueness and prevents self-follows", () => {
    const config = getTableConfig(userFollows);

    expect(config.primaryKeys[0]?.columns.map((column) => column.name)).toEqual([
      "follower_id",
      "following_id",
    ]);
    expect(config.checks.map((constraint) => constraint.name)).toContain(
      "user_follows_no_self_follow",
    );
  });

  test("cascades both user references and indexes reverse lookups", () => {
    const config = getTableConfig(userFollows);

    expect(config.foreignKeys.map((foreignKey) => foreignKey.onDelete)).toEqual([
      "cascade",
      "cascade",
    ]);
    expect(config.indexes.map((dbIndex) => dbIndex.config.name)).toEqual([
      "user_follows_follower_created_idx",
      "user_follows_following_created_idx",
    ]);
  });
});
