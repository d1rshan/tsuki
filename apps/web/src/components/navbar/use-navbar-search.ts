import { useState, useCallback } from "react";
import { useQueryState } from "nuqs";
import { usePathname } from "next/navigation";
import { useHotkey } from "@/hooks/use-hotkey";

export function useNavbarSearch() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isMangaPage = pathname === "/manga";
  const isSearchablePage = isHomePage || isMangaPage;

  const [query, setQuery] = useQueryState("q", { defaultValue: "" });

  // Track intentional manual opening
  const [isUserOpen, setIsUserOpen] = useState(false);

  // Derived state: perfectly in sync without useEffect!
  const isOpen = isSearchablePage && (isUserOpen || query.length > 0);

  const closeSearch = useCallback(() => {
    setIsUserOpen(false);
    setQuery("");
  }, [setQuery]);

  const toggleSearch = useCallback(() => {
    if (isOpen) {
      closeSearch();
    } else {
      setIsUserOpen(true);
    }
  }, [isOpen, closeSearch]);

  useHotkey("mod+k", () => {
    if (isSearchablePage) toggleSearch();
  });

  useHotkey("escape", () => {
    if (isOpen) closeSearch();
  });

  return {
    query,
    setQuery,
    isOpen,
    openSearch: () => setIsUserOpen(true),
    closeSearch,
    isSearchablePage,
    mediaType: isMangaPage ? ("manga" as const) : ("anime" as const),
  };
}
