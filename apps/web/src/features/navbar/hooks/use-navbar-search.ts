"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";

import { useMediaType } from "@/features/media/hooks/use-media-type";
import { useHotkey } from "@/shared/hooks/use-hotkey";

export function useNavbarSearch() {
  const pathname = usePathname();
  const [isManuallyOpen, setIsManuallyOpen] = useState(false);
  const previousPathname = useRef(pathname);
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });

  const isSearchable = pathname === "/";
  const [mediaType] = useMediaType({ persistQuery: isSearchable });
  const isOpen = isSearchable && (isManuallyOpen || query.length > 0);

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    previousPathname.current = pathname;
    setIsManuallyOpen(false);
    if (query) void setQuery(null);
  }, [pathname, query, setQuery]);

  const close = useCallback(() => {
    setIsManuallyOpen(false);
    void setQuery(null);
  }, [setQuery]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else setIsManuallyOpen(true);
  }, [close, isOpen]);

  useHotkey("mod+k", () => {
    if (isSearchable) toggle();
  });
  useHotkey("escape", () => {
    if (isOpen) close();
  });

  return {
    close,
    isOpen,
    isSearchable,
    mediaType,
    open: () => setIsManuallyOpen(true),
    query,
    setQuery,
  };
}
