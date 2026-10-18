import { afterEach, expect, test, vi } from "vitest";

import { profileDal } from "@tsuki/db";

afterEach(() => vi.unstubAllGlobals());

test("publishing a profile sends details, privacy and follow approvals in one Neon transaction", async () => {
  const fetchMock = vi.fn<(...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>>(
    async () =>
      new Response(
        JSON.stringify({
          results: Array.from({ length: 3 }, () => ({
            command: "UPDATE",
            fields: [],
            rows: [],
            rowCount: 0,
            rowAsArray: true,
          })),
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
  );
  vi.stubGlobal("fetch", fetchMock);
  await profileDal.updateUserProfile("owner", { bio: null }, { isPrivate: false, image: null });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const init = fetchMock.mock.calls[0]![1] as RequestInit;
  const body = JSON.parse(String(init.body)) as { queries: { query: string; params: unknown[] }[] };
  expect(body.queries).toHaveLength(3);
  expect(body.queries[0]!.query).toContain('update "user"');
  expect(body.queries[0]!.query).toContain('"is_private"');
  expect(body.queries[0]!.params.map(String)).toContain("false");
  expect(body.queries[1]!.query).toContain('insert into "profile"');
  expect(body.queries[2]!.query).toContain('delete from "follow_request"');
  expect(body.queries[2]!.query).toContain('insert into "social"');
});

test("a failed transaction rejects the entire profile save without a second request", async () => {
  const fetchMock = vi.fn<(...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>>(
    async () =>
      new Response(
        JSON.stringify({
          message: "profile constraint failed",
          code: "23514",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
  );
  vi.stubGlobal("fetch", fetchMock);
  await expect(
    profileDal.updateUserProfile("owner", { bio: null }, { isPrivate: false }),
  ).rejects.toThrow();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("leaving privacy unchanged does not approve pending follow requests", async () => {
  const fetchMock = vi.fn<(...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>>(
    async () =>
      new Response(
        JSON.stringify({
          results: Array.from({ length: 2 }, () => ({
            command: "UPDATE",
            fields: [],
            rows: [],
            rowCount: 0,
            rowAsArray: true,
          })),
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
  );
  vi.stubGlobal("fetch", fetchMock);
  await profileDal.updateUserProfile("owner", { bio: null });
  const init = fetchMock.mock.calls[0]![1] as RequestInit;
  const body = JSON.parse(String(init.body)) as { queries: unknown[] };
  expect(body.queries).toHaveLength(2);
});
