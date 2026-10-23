"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";

export const MediaBackgroundContext = createContext<{ mediaPath: string; search: string } | null>(
  null,
);

export function useMediaBackgroundSearch() {
  const background = useContext(MediaBackgroundContext);
  const pathname = usePathname();

  return background?.mediaPath === pathname ? background.search : null;
}
