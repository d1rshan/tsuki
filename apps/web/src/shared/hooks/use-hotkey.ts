import { useEffect } from "react";

type Hotkey = "escape" | "mod+k" | "/";

export function useHotkey(hotkey: Hotkey, callback: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isEditing =
        target instanceof HTMLElement &&
        (target.isContentEditable || target.matches("input, textarea, select"));
      const matches =
        hotkey === "escape"
          ? event.key === "Escape"
          : hotkey === "/"
            ? event.key === "/" && !isEditing
            : event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey);

      if (!matches) return;

      event.preventDefault();
      callback();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [callback, hotkey]);
}
