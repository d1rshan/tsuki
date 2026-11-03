import { QueryClient } from "@tanstack/react-query";
import { expect, test } from "vitest";

import { mediaKeys } from "@/features/media/query-keys";

test("sessions are isolated by account and removed by account-change cleanup", () => {
  const client = new QueryClient();
  const previous = mediaKeys.sessions("ANIME", 1, "previous");
  const current = mediaKeys.sessions("ANIME", 1, "current");
  client.setQueryData(previous, [{ start: 1, end: 6 }]);
  expect(client.getQueryData(current)).toBeUndefined();
  client.setQueryData(current, []);
  client.removeQueries({
    predicate: (query) =>
      query.queryKey[0] === "media" &&
      query.queryKey[1] === "activity" &&
      query.queryKey[4] === "previous",
  });
  expect(client.getQueryData(previous)).toBeUndefined();
  expect(client.getQueryData(current)).toEqual([]);
  client.clear();
});

test("ordinary log invalidation also invalidates sessions", async () => {
  const client = new QueryClient();
  const key = mediaKeys.sessions("MANGA", 2, "user");
  client.setQueryData(key, []);
  await client.invalidateQueries({ queryKey: mediaKeys.activity("MANGA", 2) });
  expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  client.clear();
});
