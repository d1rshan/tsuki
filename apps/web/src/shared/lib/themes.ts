export const THEMES = [
  { id: "light", name: "Light", color: "#7b9756", scheme: "light" },
  { id: "dark", name: "Dark", color: "#e5e5e5", scheme: "dark" },
  { id: "sakura", name: "Sakura", color: "#c85c8e", scheme: "light" },
  { id: "ocean", name: "Ocean", color: "#168aad", scheme: "light" },
  { id: "forest", name: "Forest", color: "#84a98c", scheme: "dark" },
  { id: "sunset", name: "Sunset", color: "#e76f51", scheme: "light" },
  { id: "lavender", name: "Lavender", color: "#8b6bb1", scheme: "light" },
  { id: "rose", name: "Rose", color: "#e11d48", scheme: "light" },
  { id: "mint", name: "Mint", color: "#2a9d8f", scheme: "light" },
  { id: "amber", name: "Amber", color: "#d97706", scheme: "light" },
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
