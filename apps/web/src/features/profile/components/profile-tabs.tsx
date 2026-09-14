"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

const TAB_DEFS = [
  { name: "Overview", segment: "" },
  { name: "Anime List", segment: "anime-list" },
  { name: "Manga List", segment: "manga-list" },
  { name: "Favorites", segment: "favorites" },
  { name: "Social", segment: "social" },
  { name: "Reviews", segment: "reviews" },
] as const;

/**
 * Primary profile nav. Stayed a single scrollable row on mobile (not a wrapped
 * grid) and keeps the active tab in view on navigation.
 */
export function ProfileTabs() {
  const pathname = usePathname();
  const username = pathname.split("/").filter(Boolean)[0] ?? "";
  const listRef = useRef<HTMLDivElement>(null);

  const tabs = TAB_DEFS.map((tab) => ({
    name: tab.name,
    href: tab.segment ? `/${username}/${tab.segment}` : `/${username}`,
  }));

  const active =
    tabs
      .filter((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? tabs[0]!.href;

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>("[data-active]")
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  return (
    <div className="mt-4">
      <Tabs value={active}>
        <TabsList ref={listRef} aria-label="Profile" className="w-full">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.name}
              value={tab.href}
              render={<Link href={tab.href} />}
              nativeButton={false}
              className="px-4"
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
