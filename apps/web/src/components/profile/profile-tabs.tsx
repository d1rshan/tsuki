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
    <div className="flex justify-center w-full">
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              prefetch={true}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 md:px-8 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive
                  ? "bg-background text-foreground shadow"
                  : "hover:text-foreground/80 hover:bg-muted/50",
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
