import { describe, expect, test } from "bun:test";

import type { DiscoveryUserSummary } from "./model";
import { discoverUsers, DISCOVERY_LIMIT } from "./discovery";

const result: DiscoveryUserSummary = {
  id: "mugi-id",
  name: "Mugi",
  username: "mugi",
  displayUsername: "Mugi",
  image: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  relationship: { following: false, followedBy: true },
};

describe("user discovery API contract", () => {
  test("bounds Popular on Tsuki and returns Follow relationship data", async () => {
    const calls: { viewerId: string; options: { limit: number; usernamePrefix?: string } }[] = [];
    const getUserDiscovery = async (
      viewerId: string,
      options: { limit: number; usernamePrefix?: string },
    ) => {
      calls.push({ viewerId, options });
      return [result];
    };

    await expect(discoverUsers("viewer-id", undefined, getUserDiscovery)).resolves.toEqual({
      users: [result],
    });
    expect(calls).toEqual([
      { viewerId: "viewer-id", options: { limit: DISCOVERY_LIMIT, usernamePrefix: undefined } },
    ]);
  });

  test("passes a Username prefix to discovery without changing it", async () => {
    let receivedPrefix: string | undefined;
    await discoverUsers("viewer-id", "Mugi", async (_viewerId, options) => {
      receivedPrefix = options.usernamePrefix;
      return [];
    });

    expect(receivedPrefix).toBe("Mugi");
  });
});
