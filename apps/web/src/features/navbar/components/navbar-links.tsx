import type { NavbarUser } from "./";
import { NavbarLink } from "./navbar-link";

type NavbarLinksProps = {
  isMobile?: boolean;
  onNavigate?: () => void;
  pathname: string;
  user: NavbarUser | null;
};

export function NavbarLinks({ isMobile = false, onNavigate, pathname, user }: NavbarLinksProps) {
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
            href: "/friends",
            label: "Friends",
            isActive: pathname.startsWith("/friends"),
          },
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

  return links.map((link) => (
    <NavbarLink
      key={link.href}
      href={link.href}
      isActive={link.isActive}
      isMobile={isMobile}
      onNavigate={onNavigate}
      prefetch={link.label === "Profile"}
    >
      {link.label}
    </NavbarLink>
  ));
}
