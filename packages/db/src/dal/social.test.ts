import { describe, expect, mock, test } from "bun:test";

import { usernamePrefixPattern } from "./discovery";

const calls: { limit?: number; orderBy?: unknown[]; where?: unknown; joins: number } = { joins: 0 };
const rows = [
  {
    id: "mugi-id",
    name: "Mugi",
    username: "mugi",
    displayUsername: "Mugi",
    image: null,
    createdAt: new Date("2026-01-02T00:00:00.000Z"),
    relationship: { following: false, followedBy: true },
  },
];
const query = {
  from: () => query,
  leftJoin: () => {
    calls.joins += 1;
    return query;
  },
  where: (condition: unknown) => {
    calls.where = condition;
    return query;
  },
  groupBy: () => query,
  orderBy: (...order: unknown[]) => {
    calls.orderBy = order;
    return query;
  },
  limit: async (limit: number) => {
    calls.limit = limit;
    return rows;
  },
};

mock.module("../db", () => ({ db: { select: () => query } }));

const { getUserDiscovery } = await import("./social");

describe("user discovery query", () => {
  test("builds bounded, relationship-aware Popular on Tsuki results", async () => {
    calls.joins = 0;
    calls.limit = undefined;
    calls.orderBy = undefined;
    calls.where = undefined;

    await expect(getUserDiscovery("viewer-id", { limit: 24 })).resolves.toEqual(rows);

    expect(calls).toMatchObject({ limit: 24, joins: 3 });
    expect(calls.where).toBeDefined();
    expect(calls.orderBy).toHaveLength(2);
  });

  test("uses a literal Username prefix pattern", () => {
    expect(usernamePrefixPattern("Mu_Gi")).toBe("mu\\_gi%");
  });
});
