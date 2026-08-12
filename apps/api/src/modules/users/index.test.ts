import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Elysia } from "elysia";

const users = {
  self: { id: "viewer", username: "self" },
  target: { id: "target", username: "target" },
};
const follows = new Set<string>();
let lastListOptions: { limit: number; offset: number } | null = null;

mock.module("@tsuki/auth/server", () => ({
  auth: {
    api: {
      getSession: async ({ headers }: { headers: Headers }) =>
        headers.get("authorization") === "viewer"
          ? { session: { id: "session" }, user: { id: "viewer", username: "self" } }
          : null,
    },
    handler: () => new Response(null, { status: 404 }),
  },
}));

mock.module("@tsuki/db", () => ({
  libraryDal: {
    getLibraryStats: async () => [],
    getUserLibrary: async () => [],
  },
  profileDal: { getProfileByUserId: async () => null, updateUserProfile: async () => [] },
  reviewsDal: { getUserReviews: async () => [] },
  socialDal: {
    followUser: async (followerId: string, followingId: string) => {
      follows.add(`${followerId}:${followingId}`);
    },
    getFollowRelationship: async (viewerId: string, profileUserId: string) => ({
      followedBy: follows.has(`${profileUserId}:${viewerId}`),
      following: follows.has(`${viewerId}:${profileUserId}`),
    }),
    getFollowerCount: async () => 1,
    getFollowers: async (_userId: string, options: { limit: number; offset: number }) => {
      lastListOptions = options;
      return [
        {
          id: "viewer",
          name: "Viewer",
          username: "self",
          displayUsername: "Viewer",
          image: null,
          createdAt: new Date("2026-01-01"),
        },
      ];
    },
    unfollowUser: async (followerId: string, followingId: string) => {
      follows.delete(`${followerId}:${followingId}`);
    },
  },
  userDal: {
    getUserByUsername: async (username: keyof typeof users) => users[username] ?? null,
  },
}));

const { userRoutes } = await import("./index");
const app = new Elysia().use(userRoutes);

function request(path: string, method: string, authenticated = true) {
  return app.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: authenticated ? { authorization: "viewer" } : undefined,
    }),
  );
}

beforeEach(() => {
  follows.clear();
  lastListOptions = null;
});

describe("follow API", () => {
  test("requires authentication and rejects self-follows", async () => {
    expect((await request("/users/target/follow", "POST", false)).status).toBe(401);

    const response = await request("/users/self/follow", "POST");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "You cannot follow yourself" });
  });

  test("makes duplicate follow and unfollow requests idempotent", async () => {
    expect(await (await request("/users/target/follow", "POST")).json()).toEqual({
      followedBy: false,
      following: true,
    });
    expect((await request("/users/target/follow", "POST")).status).toBe(200);
    expect(follows).toEqual(new Set(["viewer:target"]));

    expect(await (await request("/users/target/follow", "DELETE")).json()).toEqual({
      followedBy: false,
      following: false,
    });
    expect((await request("/users/target/follow", "DELETE")).status).toBe(200);
    expect(follows.size).toBe(0);
  });

  test("derives mutual following without separate state", async () => {
    follows.add("target:viewer");

    expect(await (await request("/users/target/follow", "POST")).json()).toEqual({
      followedBy: true,
      following: true,
    });
  });

  test("keeps lists public and bounded for logged-out visitors", async () => {
    const response = await request("/users/target/followers?limit=20&offset=40", "GET", false);

    expect(response.status).toBe(200);
    expect(lastListOptions).toEqual({ limit: 20, offset: 40 });
    expect(await response.json()).toEqual({
      total: 1,
      users: [
        {
          id: "viewer",
          name: "Viewer",
          username: "self",
          displayUsername: "Viewer",
          image: null,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
  });
});
