import { expect, test } from "@playwright/test";
import { instant } from "@next/playwright";

test("discover has a useful shell before URL state and data resolve", async ({ page, baseURL }) => {
  await instant(
    page,
    async () => {
      await page.goto("/");
      await expect(page.getByRole("status", { name: "Loading discover" })).toBeVisible();
    },
    { baseURL },
  );
  await expect(page.getByRole("status", { name: "Loading discover" })).toBeHidden();
});

test("admin access check exposes a shell without protected content", async ({ page, baseURL }) => {
  await instant(
    page,
    async () => {
      await page.goto("/admin");
      await expect(page.getByRole("heading", { name: "Administration" })).toBeVisible();
      await expect(page.getByText("Checking access…")).toBeVisible();
      await expect(page.getByText("Total Users")).toHaveCount(0);
    },
    { baseURL },
  );
  await expect(page).toHaveURL("/");
});

test("navigation to social paints its destination before the session streams", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("tab", { name: "Social", exact: true })).toBeVisible();
  await instant(page, async () => {
    await page.getByRole("tab", { name: "Social", exact: true }).click();
    await expect(page.getByText("Recent reviews", { exact: true })).toBeVisible();
  });
  await expect(page.getByRole("status", { name: "Checking sign-in status" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Public" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Following" })).toHaveCount(0);
});

test("direct social load keeps feed mode neutral while the session is pending", async ({
  page,
  baseURL,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  let pendingSlot: { x: number; y: number; width: number; height: number } | null = null;
  await instant(
    page,
    async () => {
      await page.goto("/social?feed=following");
      await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Recent reviews" })).toBeVisible();
      await expect(page.getByRole("status", { name: "Checking sign-in status" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Public" })).toHaveCount(0);
      await expect(page.getByRole("tab", { name: "Following" })).toHaveCount(0);
      pendingSlot = await page
        .getByRole("status", { name: "Checking sign-in status" })
        .boundingBox();
      expect(pendingSlot).not.toBeNull();
      expect(pendingSlot!.x + pendingSlot!.width).toBeLessThanOrEqual(304);
    },
    { baseURL },
  );
  await expect(page.getByRole("status", { name: "Checking sign-in status" })).toHaveCount(0);
  const signedOutSlot = await page
    .locator('section[aria-label="Activity"] > div:first-child > div.invisible')
    .boundingBox();
  expect(signedOutSlot).not.toBeNull();
  expect(signedOutSlot!.y).toBe(pendingSlot!.y);
  expect(signedOutSlot!.height).toBe(pendingSlot!.height);
});

test("social feed follows client session changes and the feed URL", async ({ page }) => {
  let user: string | null = "viewer";
  await page.route("**/api/auth/get-session**", (route) =>
    route.fulfill({
      json: user
        ? {
            session: {
              id: "session-viewer",
              userId: user,
              expiresAt: "2099-01-01T00:00:00.000Z",
            },
            user: {
              id: user,
              username: user,
              name: user,
              email: `${user}@example.com`,
              emailVerified: true,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          }
        : null,
    }),
  );
  await page.route("**/api/activity**", (route) =>
    route.fulfill({ json: { activities: [], nextCursor: null } }),
  );
  await page.route("**/api/reviews**", (route) =>
    route.fulfill({ json: { reviews: [], nextCursor: null } }),
  );

  await page.goto("/");
  await page.getByRole("tab", { name: "Social", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Public" })).toBeVisible();

  await page.goto("/social?feed=following");
  const following = page.getByRole("tab", { name: "Following" });
  await expect(following).toBeVisible();
  await expect(following).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Public" }).click();
  await expect(page.getByRole("tab", { name: "Public" })).toHaveAttribute("aria-selected", "true");
  await following.click();
  await expect(following).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/\/social\?feed=following$/);

  user = null;
  await page.evaluate(() => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "better-auth.message",
        newValue: JSON.stringify({ event: "session", data: { trigger: "test" } }),
      }),
    );
  });
  await expect(following).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
});
