import { ChevronDown } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

import type { NavbarUser } from "./";

type NavbarLinksProps = {
  pathname: string;
  user: NavbarUser | null;
};

export function NavbarLinks({ pathname, user }: NavbarLinksProps) {
  const links = [
    {
      href: "/",
      label: "Discover",
      isActive:
        pathname === "/" || pathname.startsWith("/anime/") || pathname.startsWith("/manga/"),
    },
    {
      href: "/social",
      label: "Social",
      isActive: pathname === "/social" || pathname.startsWith("/social/"),
    },
    ...(user?.username
      ? [
          {
            href: `/${user.username}`,
            label: "Profile",
            isActive: pathname.split("/")[1]?.toLowerCase() === user.username.toLowerCase(),
          },
        ]
      : []),
  ];

  // null keeps Tabs controlled when the route has no matching navigation item.
  const activeHref = links.find((link) => link.isActive)?.href ?? null;

  const activeLabel = links.find((link) => link.isActive)?.label ?? "Menu";

  return (
    <>
      <div className="pointer-events-auto rounded-full bg-muted p-1 md:hidden">
        <DropdownMenu key={pathname}>
          <DropdownMenuTrigger
            aria-label={`Main navigation: ${activeLabel}`}
            className="group inline-flex items-center justify-center gap-1.5 rounded-full border-[0.2px] border-border bg-card px-3 py-[7px] text-sm font-medium text-card-foreground shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span
              key={activeLabel}
              className="animate-in fade-in duration-200 motion-reduce:animate-none"
            >
              {activeLabel}
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-3.5 transition-transform duration-200 group-data-popup-open:rotate-180 motion-reduce:transition-none"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            aria-label="Main navigation"
            className="min-w-36 rounded-3xl bg-muted p-1 motion-reduce:animate-none!"
          >
            {links.map((link) => (
              <DropdownMenuItem
                key={link.href}
                nativeButton={false}
                render={
                  <Link
                    href={link.href}
                    prefetch={link.label === "Profile"}
                    aria-current={link.isActive ? "page" : undefined}
                  />
                }
                className={cn(
                  "justify-center rounded-full px-4 py-[7px] font-medium text-muted-foreground transition-colors duration-200 data-highlighted:bg-card data-highlighted:text-card-foreground motion-reduce:transition-none",
                  link.isActive &&
                    "border-[0.2px] border-border bg-card text-card-foreground shadow-sm",
                )}
              >
                {link.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Tabs
        value={activeHref}
        orientation="horizontal"
        variant="rounded"
        className="pointer-events-auto max-md:hidden"
      >
        <TabsList aria-label="Main navigation" className="max-md:h-10.5">
          {links.map((link) => (
            <TabsTrigger
              key={link.href}
              value={link.href}
              nativeButton={false}
              render={
                <Link
                  href={link.href}
                  prefetch={link.label === "Profile"}
                  aria-current={link.isActive ? "page" : undefined}
                />
              }
            >
              {link.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
