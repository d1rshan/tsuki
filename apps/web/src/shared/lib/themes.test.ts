import { describe, expect, test } from "bun:test";

import { getThemeScheme, THEMES, THEME_IDS } from "./themes";

describe("themes", () => {
  test("exposes fifteen unique presets", () => {
    expect(THEMES).toHaveLength(15);
    expect(new Set(THEME_IDS).size).toBe(THEMES.length);
  });

  test("maps presets to a browser color scheme", () => {
    expect(getThemeScheme("sakura")).toBe("light");
    expect(getThemeScheme("midnight")).toBe("dark");
    expect(getThemeScheme("unknown")).toBeUndefined();
  });
});
