"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-8 w-14 items-center rounded-full bg-muted p-1 text-muted-foreground transition-colors motion-reduce:transition-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        aria-hidden="true"
        className={`absolute size-6 rounded-full border-[0.2px] border-border bg-card shadow-sm transition-transform motion-reduce:transition-none ${isDark ? "translate-x-6" : "translate-x-0"}`}
      />
      <Sun
        aria-hidden="true"
        className={`absolute left-2 z-10 size-4 transition-colors ${isDark ? "" : "text-foreground"}`}
      />
      <Moon
        aria-hidden="true"
        className={`absolute right-2 z-10 size-4 transition-colors ${isDark ? "text-foreground" : ""}`}
      />
    </button>
  );
}
