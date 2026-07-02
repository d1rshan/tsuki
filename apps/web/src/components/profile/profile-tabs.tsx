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
    { name: "Library", href: `/profile/${username}/library` },
    { name: "Reviews", href: `/profile/${username}/reviews` },
  ];

  return (
    <div className="flex w-full border-b border-border/40 relative">
      <div className="flex w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              prefetch={true}
              className={cn(
                "px-6 py-4 text-sm transition-all duration-300 relative whitespace-nowrap",
                isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground font-medium hover:text-foreground/80",
              )}
            >
              {tab.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
