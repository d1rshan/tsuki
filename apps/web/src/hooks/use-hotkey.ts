import { useEffect } from "react";

interface HotkeyOptions {
  preventDefault?: boolean;
}

/**
 * A generic hook to handle keyboard shortcuts.
 * Supports modifiers like 'mod+k' (handles both ctrl+k and cmd+k) or simple keys like 'escape'.
 */
export function useHotkey(
  shortcut: string,
  callback: (e: KeyboardEvent) => void,
  options: HotkeyOptions = { preventDefault: true },
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isModK =
        shortcut === "mod+k" && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      const isEscape = shortcut.toLowerCase() === "escape" && e.key === "Escape";

      if (isModK || isEscape) {
        if (options.preventDefault) e.preventDefault();
        callback(e);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [shortcut, callback, options.preventDefault]);
}
