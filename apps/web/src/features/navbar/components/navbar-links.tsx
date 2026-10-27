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

  return (
    <Tabs
      value={activeHref}
      orientation="horizontal"
      variant="rounded"
      className="pointer-events-auto"
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
  );
}
