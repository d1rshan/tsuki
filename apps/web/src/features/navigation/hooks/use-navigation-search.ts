"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { parseAsStringEnum, useQueryState } from "nuqs";

import type { MediaType } from "@tsuki/api/types";

import { useHotkey } from "@/shared/hooks/use-hotkey";

const MEDIA_TYPES = ["ANIME", "MANGA"] as const;

export function useNavigationSearch() {
  const pathname = usePathname();
  const [isManuallyOpen, setIsManuallyOpen] = useState(false);
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const [mediaType] = useQueryState(
    "type",
    parseAsStringEnum<MediaType>([...MEDIA_TYPES]).withDefault("ANIME"),
  );

  const isSearchable = pathname === "/";
  const isOpen = isSearchable && (isManuallyOpen || query.length > 0);

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
