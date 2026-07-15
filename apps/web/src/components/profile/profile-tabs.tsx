"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

import { cn } from "@/lib/utils";

export function ProfileTabs() {
  const pathname = usePathname();
  const params = useParams();

  const username = params.username;

  const tabs = [
    { name: "Overview", href: `/profile/${username}` },
    { name: "Favorites", href: `/profile/${username}/favorites` },
    { name: "Library", href: `/profile/${username}/library` },
    { name: "Reviews", href: `/profile/${username}/reviews` },
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 bg-muted/30 backdrop-blur-md border border-border/50 rounded-2xl w-fit shadow-sm overflow-x-auto max-w-full">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            prefetch={true}
            className={cn(
              "px-5 py-2 text-sm font-semibold transition-all duration-300 rounded-xl",
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10",
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
