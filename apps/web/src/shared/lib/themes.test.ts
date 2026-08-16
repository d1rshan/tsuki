import { describe, expect, test } from "bun:test";

import { getThemeScheme, THEMES, THEME_IDS } from "./themes";

const themeCss = await Bun.file(new URL("../../app/themes.css", import.meta.url)).text();
const globalCss = await Bun.file(new URL("../../app/globals.css", import.meta.url)).text();
const requiredColors = [
  "background",
  "foreground",
  "surface",
  "surface-muted",
  "primary",
  "primary-foreground",
  "secondary",
  "muted-foreground",
  "destructive",
  "border",
] as const;

function getThemeBlock(id: string): string {
  return themeCss.match(new RegExp(`\\.${id} \\{([^}]+)`))?.[1] ?? "";
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);

  return (lighter + 0.05) / (darker + 0.05);
}

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

  test("defines every preset with the required hex colors", () => {
    const cssThemeIds = [...themeCss.matchAll(/^\.([\w-]+) \{/gm)].map((match) => match[1]);

    expect(cssThemeIds).toEqual(THEME_IDS);
    for (const id of THEME_IDS) {
      const block = getThemeBlock(id);

      for (const color of requiredColors) {
        expect(block).toMatch(new RegExp(`--${color}: #[0-9a-f]{6}(?:[0-9a-f]{2})?;`));
      }
    }
  });

  test("keeps preset metadata synchronized", () => {
    for (const { id, color, scheme } of THEMES) {
      expect(getThemeBlock(id)).toContain(`color-scheme: ${scheme};`);
      expect(getThemeBlock(id)).toContain(`--primary: ${color};`);
      expect(globalCss.includes(`.${id} *`)).toBe(scheme === "dark");
    }
  });

  test("keeps semantic text colors readable", () => {
    const failures: string[] = [];
    const pairs = [
      ["foreground", "background"],
      ["foreground", "surface"],
      ["muted-foreground", "secondary"],
      ["primary", "background"],
      ["primary-foreground", "primary"],
      ["destructive", "background"],
    ] as const;

    for (const id of THEME_IDS) {
      const colors = Object.fromEntries(
        [...getThemeBlock(id).matchAll(/--([\w-]+): (#[0-9a-f]{6});/g)].map((match) => [
          match[1],
          match[2],
        ]),
      );

      for (const [foreground, background] of pairs) {
        const ratio = contrastRatio(colors[foreground], colors[background]);

        if (ratio < 4.5) {
          failures.push(`${id}: ${foreground} on ${background} (${ratio.toFixed(2)}:1)`);
        }
      }
    }

    expect(failures).toEqual([]);
  });
});
