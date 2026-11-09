import { expect, test } from "@playwright/test";

test.use({
  launchOptions: {
    executablePath: process.env.CHROMIUM_PATH,
    args: [
      "--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4",
    ],
  },
});

for (const type of ["Anime", "Manga"]) {
  test(`${type} card collapses after dismissing its modal away from the card`, async ({ page }) => {
    await page.goto("/");
    if (type === "Manga") await page.getByRole("tab", { name: "Manga" }).click();

    const card = page
      .locator("main .group")
      .filter({ has: page.locator("h3") })
      .first();
    const trigger = card.locator("a").first();
    await expect(trigger).toHaveAttribute("href", new RegExp(`^/${type.toLowerCase()}/`));
    const actions = card.locator("div[aria-hidden].z-20");
    await trigger.hover();
    await expect(actions).toHaveAttribute("aria-hidden", "false");
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.mouse.move(0, 0);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(actions).toHaveAttribute("aria-hidden", "true");

    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(trigger).toBeFocused();
    await expect(actions).toHaveAttribute("aria-hidden", "false");
  });
}
