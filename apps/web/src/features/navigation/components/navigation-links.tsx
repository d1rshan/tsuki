import Link from "next/link";

import { cn } from "@/lib/utils";

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
        "text-xs font-bold uppercase transition-colors",
        isMobile ? "rounded-md px-3 py-3" : "py-2",
        link.isActive
          ? isMobile
            ? "bg-muted text-foreground"
            : "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {link.label}
    </Link>
  ));
}
