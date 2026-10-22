import Link from "next/link";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

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
      isActive: pathname.startsWith("/social"),
    },
    ...(user?.username
      ? [
          {
            href: `/${user.username}`,
            label: "Profile",
            isActive: pathname === `/${user.username}` || pathname.startsWith(`/${user.username}/`),
          },
        ]
      : []),
    ...(user?.role === "admin" || user?.role === "owner"
      ? [{ href: "/admin", label: "Admin", isActive: pathname.startsWith("/admin") }]
      : []),
  ];

  const activeHref = links.find((link) => link.isActive)?.href;

  return (
    <Tabs value={activeHref} orientation="horizontal" variant="rounded">
      <TabsList aria-label="Main navigation">
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
  );
}
