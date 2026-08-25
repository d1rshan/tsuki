import { slugify } from "@/shared/lib/utils";

type HexColor = `#${string}`;
type ThemeScheme = "light" | "dark";

type ThemeColors = {
  background: HexColor;
  foreground: HexColor;
  surface: HexColor;
  "surface-muted": HexColor;
  primary: HexColor;
  "primary-foreground": HexColor;
  secondary: HexColor;
  "muted-foreground": HexColor;
  destructive: HexColor;
  border: HexColor;
  input?: HexColor;
  ring?: HexColor;
};

type Theme = {
  name: string;
  scheme: ThemeScheme;
  colors: ThemeColors;
};

export const THEMES = [
  {
    name: "Paper",
    scheme: "light",
    colors: {
      background: "#ffffff",
      foreground: "#0a0a0a",
      surface: "#ffffff",
      "surface-muted": "#fafafa",
      primary: "#171717",
      "primary-foreground": "#fafafa",
      secondary: "#f5f5f5",
      "muted-foreground": "#737373",
      destructive: "#dc2626",
      border: "#e5e5e5",
      input: "#e5e5e5",
      ring: "#a3a3a3",
    },
  },
  {
    name: "Ink",
    scheme: "dark",
    colors: {
      background: "#0a0a0a",
      foreground: "#fafafa",
      surface: "#171717",
      "surface-muted": "#171717",
      primary: "#e5e5e5",
      "primary-foreground": "#171717",
      secondary: "#262626",
      "muted-foreground": "#a3a3a3",
      destructive: "#f87171",
      border: "#ffffff1a",
      input: "#ffffff26",
      ring: "#737373",
    },
  },
  {
    name: "Matcha",
    scheme: "light",
    colors: {
      background: "#eef5e6",
      foreground: "#44624a",
      surface: "#ffffff",
      "surface-muted": "#eaf0e1",
      primary: "#526b3a",
      "primary-foreground": "#ffffff",
      secondary: "#e6ecd8",
      "muted-foreground": "#596653",
      destructive: "#b42323",
      border: "#d3dcc3",
    },
  },
  {
    name: "Sakura",
    scheme: "light",
    colors: {
      background: "#fff7fa",
      foreground: "#5c3345",
      surface: "#ffffff",
      "surface-muted": "#fceaf1",
      primary: "#9b3f68",
      "primary-foreground": "#ffffff",
      secondary: "#f8dce8",
      "muted-foreground": "#745162",
      destructive: "#c83e4d",
      border: "#edc5d6",
    },
  },
  {
    name: "Ocean",
    scheme: "light",
    colors: {
      background: "#f0f9fb",
      foreground: "#164e63",
      surface: "#ffffff",
      "surface-muted": "#e1f2f6",
      primary: "#126782",
      "primary-foreground": "#ffffff",
      secondary: "#d6eef3",
      "muted-foreground": "#3f6a76",
      destructive: "#b52b3c",
      border: "#b9dce5",
    },
  },
  {
    name: "Forest",
    scheme: "dark",
    colors: {
      background: "#17251d",
      foreground: "#e8f1e9",
      surface: "#22352a",
      "surface-muted": "#1d3025",
      primary: "#84a98c",
      "primary-foreground": "#142019",
      secondary: "#354f3e",
      "muted-foreground": "#b8c8bb",
      destructive: "#e76f51",
      border: "#46614e",
    },
  },
  {
    name: "Sunset",
    scheme: "light",
    colors: {
      background: "#fff8f2",
      foreground: "#5c352b",
      surface: "#ffffff",
      "surface-muted": "#faebe0",
      primary: "#b84a30",
      "primary-foreground": "#ffffff",
      secondary: "#f8dfd0",
      "muted-foreground": "#755247",
      destructive: "#c44536",
      border: "#edc8b7",
    },
  },
  {
    name: "Lavender",
    scheme: "light",
    colors: {
      background: "#faf7ff",
      foreground: "#49385d",
      surface: "#ffffff",
      "surface-muted": "#f0e9f8",
      primary: "#684b8a",
      "primary-foreground": "#ffffff",
      secondary: "#e9ddf3",
      "muted-foreground": "#665575",
      destructive: "#a92f50",
      border: "#d8c8e7",
    },
  },
  {
    name: "Rose",
    scheme: "light",
    colors: {
      background: "#fff5f6",
      foreground: "#4c1d2a",
      surface: "#ffffff",
      "surface-muted": "#ffe4e8",
      primary: "#c9143c",
      "primary-foreground": "#ffffff",
      secondary: "#fecdd6",
      "muted-foreground": "#794151",
      destructive: "#b91c1c",
      border: "#f3a9b8",
    },
  },
  {
    name: "Mint",
    scheme: "light",
    colors: {
      background: "#f2fbf8",
      foreground: "#244d48",
      surface: "#ffffff",
      "surface-muted": "#e2f5ef",
      primary: "#1f776d",
      "primary-foreground": "#ffffff",
      secondary: "#d2eee7",
      "muted-foreground": "#456f69",
      destructive: "#b8322e",
      border: "#b7ded5",
    },
  },
  {
    name: "Amber",
    scheme: "light",
    colors: {
      background: "#fffbeb",
      foreground: "#573a08",
      surface: "#ffffff",
      "surface-muted": "#fef3c7",
      primary: "#a84e07",
      "primary-foreground": "#ffffff",
      secondary: "#fde7a5",
      "muted-foreground": "#6b4f20",
      destructive: "#dc2626",
      border: "#f1d185",
    },
  },
  {
    name: "Nord",
    scheme: "dark",
    colors: {
      background: "#2e3440",
      foreground: "#eceff4",
      surface: "#3b4252",
      "surface-muted": "#353c4a",
      primary: "#88c0d0",
      "primary-foreground": "#2e3440",
      secondary: "#434c5e",
      "muted-foreground": "#b6bfcc",
      destructive: "#f07b84",
      border: "#4c566a",
    },
  },
  {
    name: "Dracula",
    scheme: "dark",
    colors: {
      background: "#282a36",
      foreground: "#f8f8f2",
      surface: "#343746",
      "surface-muted": "#30323f",
      primary: "#bd93f9",
      "primary-foreground": "#282a36",
      secondary: "#44475a",
      "muted-foreground": "#b8b8b2",
      destructive: "#ff5555",
      border: "#56596e",
    },
  },
  {
    name: "Coffee",
    scheme: "dark",
    colors: {
      background: "#241c18",
      foreground: "#f2e5d5",
      surface: "#342922",
      "surface-muted": "#2d231e",
      primary: "#c08a62",
      "primary-foreground": "#241c18",
      secondary: "#4a392f",
      "muted-foreground": "#b9a697",
      destructive: "#d76a5b",
      border: "#5a463a",
    },
  },
  {
    name: "Cyberpunk",
    scheme: "dark",
    colors: {
      background: "#101014",
      foreground: "#f5f5f5",
      surface: "#1c1c24",
      "surface-muted": "#17171e",
      primary: "#fcee0a",
      "primary-foreground": "#101014",
      secondary: "#2d2942",
      "muted-foreground": "#aaa6b8",
      destructive: "#ff2a6d",
      border: "#48415e",
    },
  },
  {
    name: "Midnight",
    scheme: "dark",
    colors: {
      background: "#0f172a",
      foreground: "#e2e8f0",
      surface: "#1e293b",
      "surface-muted": "#172033",
      primary: "#818cf8",
      "primary-foreground": "#111827",
      secondary: "#334155",
      "muted-foreground": "#aab7c8",
      destructive: "#f87171",
      border: "#475569",
    },
  },
] as const satisfies readonly Theme[];

export const THEME_IDS = THEMES.map(({ name }) => slugify(name));
export const THEME_CLASSES = [...THEME_IDS, "light", "dark"];

export function getThemeId(theme: Pick<Theme, "name">): string {
  return slugify(theme.name);
}

export function getThemeScheme(theme: string | undefined): ThemeScheme | undefined {
  if (theme === "light" || theme === "dark") return theme;

  return THEMES.find((preset) => getThemeId(preset) === theme)?.scheme;
}
