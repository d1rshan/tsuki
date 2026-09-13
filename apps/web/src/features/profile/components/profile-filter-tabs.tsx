"use client";

import Link from "next/link";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

export type ProfileFilterOption = {
  value: string;
  label: string;
  href: string;
  count?: number;
};

/** Secondary in-page filters (status, media type, list) as URL-backed tabs. */
export function ProfileFilterTabs({
  className,
  label,
  options,
  orientation = "horizontal",
  selected,
}: {
  className?: string;
  label: string;
  options: ProfileFilterOption[];
  orientation?: "horizontal" | "vertical";
  selected: string;
}) {
  return (
    <Tabs value={selected} orientation={orientation} className={className}>
      <TabsList aria-label={label} className={cn(orientation === "vertical" && "w-full")}>
        {options.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            render={<Link href={option.href} />}
            nativeButton={false}
            className="px-4"
          >
            <span className="flex-1 text-left">{option.label}</span>
            {option.count != null && (
              <span className="tabular-nums opacity-60">{option.count}</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
