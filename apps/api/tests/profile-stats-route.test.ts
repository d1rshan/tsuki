import { beforeEach, describe, expect, test, vi } from "vitest";
import { Elysia } from "elysia";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  canView: vi.fn(),
  getStatistics: vi.fn(),
  viewer: null as { id: string } | null,
}));

vi.mock("@tsuki/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tsuki/db")>();
  return {
    ...actual,
    userDal: { ...actual.userDal, getUserByUsername: mocks.getUser },
    socialDal: { ...actual.socialDal, canViewProfile: mocks.canView },
    libraryDal: { ...actual.libraryDal, getUserStatistics: mocks.getStatistics },
  };
});

vi.mock("../src/plugins/auth", async () => {
  const { Elysia } = await import("elysia");
  return {
    authPlugin: new Elysia({ name: "profile-stats-test-auth" }).macro({
      optionalAuth: { resolve: () => ({ viewer: mocks.viewer }) },
      auth: { resolve: () => ({ user: { id: "viewer" }, session: {} }) },
    }),
  };
});

const { profilesRoutes } = await import("../src/modules/profiles");
const { errorsPlugin } = await import("../src/plugins/errors");
const app = new Elysia().use(errorsPlugin).use(profilesRoutes);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.viewer = null;
  mocks.getUser.mockResolvedValue({ id: "owner", username: "nami", isPrivate: true });
  mocks.canView.mockResolvedValue(false);
  mocks.getStatistics.mockResolvedValue([]);
});

describe("GET /users/:username/stats", () => {
  test("rejects inaccessible profiles before loading their statistics", async () => {
    const response = await app.handle(new Request("http://localhost/users/nami/stats"));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "This profile is private" });
    expect(mocks.canView).toHaveBeenCalledWith(null, "owner", true);
    expect(mocks.getStatistics).not.toHaveBeenCalled();
  });

  test("passes the viewer through the access check and returns statistics when allowed", async () => {
    mocks.viewer = { id: "follower" };
    mocks.canView.mockResolvedValue(true);
    const response = await app.handle(new Request("http://localhost/users/nami/stats"));
    expect(response.status).toBe(200);
    expect(mocks.canView).toHaveBeenCalledWith("follower", "owner", true);
    expect(mocks.getStatistics).toHaveBeenCalledWith("owner");
    expect(await response.json()).toMatchObject({ ANIME: { total: 0 }, MANGA: { total: 0 } });
  });

  test("returns 404 for unknown profiles without reading statistics", async () => {
    mocks.getUser.mockResolvedValue(null);
    const response = await app.handle(new Request("http://localhost/users/missing/stats"));
    expect(response.status).toBe(404);
    expect(mocks.getStatistics).not.toHaveBeenCalled();
  });
});
