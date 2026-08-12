export const THEMES = [
  { id: "light", name: "Light", color: "#526b3a", scheme: "light" },
  { id: "dark", name: "Dark", color: "#e5e5e5", scheme: "dark" },
  { id: "sakura", name: "Sakura", color: "#9b3f68", scheme: "light" },
  { id: "ocean", name: "Ocean", color: "#126782", scheme: "light" },
  { id: "forest", name: "Forest", color: "#84a98c", scheme: "dark" },
  { id: "sunset", name: "Sunset", color: "#b84a30", scheme: "light" },
  { id: "lavender", name: "Lavender", color: "#684b8a", scheme: "light" },
  { id: "rose", name: "Rose", color: "#c9143c", scheme: "light" },
  { id: "mint", name: "Mint", color: "#1f776d", scheme: "light" },
  { id: "amber", name: "Amber", color: "#a84e07", scheme: "light" },
  { id: "nord", name: "Nord", color: "#88c0d0", scheme: "dark" },
  { id: "dracula", name: "Dracula", color: "#bd93f9", scheme: "dark" },
  { id: "coffee", name: "Coffee", color: "#c08a62", scheme: "dark" },
  { id: "cyberpunk", name: "Cyberpunk", color: "#fcee0a", scheme: "dark" },
  { id: "midnight", name: "Midnight", color: "#818cf8", scheme: "dark" },
] as const;

export const THEME_IDS = THEMES.map(({ id }) => id);

export function getThemeScheme(theme: string | undefined): "light" | "dark" | undefined {
  return THEMES.find(({ id }) => id === theme)?.scheme;
}
