import Link from "next/link";

import { cn } from "@/shared/lib/utils";

import type { NavigationUser } from "./site-navigation";

type NavigationLinksProps = {
  isMobile?: boolean;
  onNavigate?: () => void;
  pathname: string;
  user: NavigationUser | null;
};

export function NavigationLinks({
  isMobile = false,
  onNavigate,
  pathname,
  user,
}: NavigationLinksProps) {
  const links = [
    {
      href: "/",
      label: "Discover",
      isActive:
        pathname === "/" || pathname.startsWith("/anime/") || pathname.startsWith("/manga/"),
    },
    ...(user?.username
      ? [
          {
            href: `/profile/${user.username}`,
            label: "Profile",
            isActive: pathname.startsWith(`/profile/${user.username}`),
          },
        ]
      : []),
    ...(user?.role === "admin" || user?.role === "owner"
      ? [{ href: "/admin", label: "Admin", isActive: pathname.startsWith("/admin") }]
      : []),
  ];

  return links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      onNavigate={onNavigate}
      className={cn(
        isMobile
          ? "flex w-full items-center rounded-lg px-3 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300"
          : "group/link inline-flex items-center py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 hover:text-foreground",
        link.isActive ? "text-foreground" : "text-muted-foreground",
        isMobile &&
          (link.isActive ? "bg-foreground/5" : "hover:bg-foreground/5 hover:text-foreground"),
      )}
    >
      {isMobile ? (
        link.label
      ) : (
        <span className="relative">
          {link.label}
          <span
            className={cn(
              "absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300",
              link.isActive ? "w-full" : "w-0 group-hover/link:w-full",
            )}
          />
        </span>
      )}
    </Link>
  ));
}
