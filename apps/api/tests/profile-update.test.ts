import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Elysia } from "elysia";

const mocks = vi.hoisted(() => ({ update: vi.fn() }));

vi.mock("@tsuki/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tsuki/db")>();
  return {
    ...actual,
    profileDal: { ...actual.profileDal, updateUserProfile: mocks.update },
  };
});
vi.mock("../src/plugins/auth", async () => {
  const { Elysia } = await import("elysia");
  return {
    authPlugin: new Elysia({ name: "profile-update-test-auth" }).macro({
      optionalAuth: { resolve: () => ({ viewer: null }) },
      auth: { resolve: () => ({ user: { id: "owner", image: null }, session: {} }) },
    }),
  };
});

const { profilesRoutes } = await import("../src/modules/profiles");
const { errorsPlugin } = await import("../src/plugins/errors");
const app = new Elysia().use(errorsPlugin).use(profilesRoutes);

const save = (body: unknown) =>
  app.handle(
    new Request("http://localhost/me/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  mocks.update.mockReset();
  mocks.update.mockResolvedValue({
    profile: { bio: null, bannerImage: null, socialLinks: {} },
    image: null,
    isPrivate: false,
  });
});
afterEach(() => vi.restoreAllMocks());

describe("profile and privacy updates", () => {
  test("saves profile details and privacy through one combined database operation", async () => {
    const response = await save({
      bio: null,
      socialLinks: { website: "https://example.com" },
      isPrivate: false,
    });
    expect(response.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledExactlyOnceWith(
      "owner",
      { bio: null, socialLinks: { website: "https://example.com" } },
      { isPrivate: false },
    );
    expect(await response.json()).toMatchObject({ isPrivate: false });
  });

  test("omitted privacy and avatar fields stay omitted", async () => {
    expect((await save({ bio: null })).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledExactlyOnceWith("owner", { bio: null }, {});
  });

  test("invalid privacy or image input never reaches the database", async () => {
    expect((await save({ isPrivate: "true" })).status).toBe(422);
    expect((await save({ isPrivate: true, image: "https://example.com/foreign.png" })).status).toBe(
      422,
    );
    expect(mocks.update).not.toHaveBeenCalled();
  });

  test("transaction failures report a failed save", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.update.mockRejectedValue(new Error("transaction rolled back"));
    const response = await save({ bio: null, isPrivate: true });
    expect(response.status).toBe(500);
    expect(mocks.update).toHaveBeenCalledTimes(1);
  });

  test("the separate privacy endpoint is removed", async () => {
    const response = await app.handle(
      new Request("http://localhost/me/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: '{"isPrivate":false}',
      }),
    );
    expect(response.status).toBe(404);
  });
});
