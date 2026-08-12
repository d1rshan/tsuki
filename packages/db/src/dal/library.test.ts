import { describe, expect, test } from "bun:test";

describe("library progress activity", () => {
  test("batches progress writes with an atomic cursor claim", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
    const { buildEntryWrite } = await import("./library");
    const [upsert, recordActivity] = buildEntryWrite({
      userId: "user-1",
      mediaId: 1,
      mediaType: "ANIME",
      progress: 3,
    });
    const upsertSql = upsert.toSQL().sql;
    const activitySql = recordActivity?.getQuery().sql;

    expect(upsertSql).toContain('"activity_progress" = coalesce');
    expect(activitySql).toContain("with current_progress as");
    expect(activitySql).toContain('insert into "progress_activity"');
  });

  test("does not create an activity query when progress was omitted", async () => {
    process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
    const { buildEntryWrite } = await import("./library");

    expect(
      buildEntryWrite({ userId: "user-1", mediaId: 1, mediaType: "ANIME", score: 8 }),
    ).toHaveLength(1);
  });
});
