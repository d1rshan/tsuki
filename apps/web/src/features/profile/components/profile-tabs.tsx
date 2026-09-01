"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function ProfileTabs({ username }: { username: string }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: `/${username}` },
    { name: "Anime List", href: `/${username}/anime-list` },
    { name: "Manga List", href: `/${username}/manga-list` },
    { name: "Favorites", href: `/${username}/favorites` },
    { name: "Social", href: `/${username}/social` },
    { name: "Reviews", href: `/${username}/reviews` },
  ];

  return (
    <Tabs value={pathname}>
      <TabsList aria-label="Profile">
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
  );
}
