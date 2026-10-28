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
});
