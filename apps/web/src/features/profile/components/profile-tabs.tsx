"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function ProfileTabs({ username }: { username: string }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: `/profile/${username}` },
    { name: "Favorites", href: `/profile/${username}/favorites` },
    { name: "Library", href: `/profile/${username}/library` },
    { name: "Reviews", href: `/profile/${username}/reviews` },
  ];

  return (
    <nav
      className="flex w-fit max-w-full items-center gap-1 rounded-lg border bg-muted/30 p-1"
      aria-label="Profile"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10",
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
