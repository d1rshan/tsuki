"use client";

import { usePathname } from "next/navigation";

import { authClient } from "@tsuki/auth/client";

import { DiscoverControls } from "@/features/discover/components/discover-controls";
import { ThemeSelector } from "@/shared/components/theme-selector";

import { NavbarAuth } from "./navbar-auth";
import { NavbarLinks } from "./navbar-links";

export type NavbarUser = {
  role?: string | null;
  username?: string | null;
};

export function Navbar() {
  const pathname = usePathname();
  // ponytail: client session keeps the home route static; accepted tradeoff is a login flash until it resolves.
  const { data } = authClient.useSession();
  const user: NavbarUser | null = data?.user
    ? { role: data.user.role, username: data.user.username }
    : null;

  return (
    <nav
      className="group/navbar pointer-events-none fixed inset-x-0 top-0 z-40 pt-4 md:pt-6"
      aria-label="Main"
    >
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 md:gap-4">
        <div className="pointer-events-auto flex min-w-0 items-center gap-3 max-md:group-has-[[data-search-expanded=true]]/navbar:hidden md:gap-6">
          <div className="flex min-w-0 items-center overflow-x-auto no-scrollbar">
            <NavbarLinks pathname={pathname} user={user} />
          </div>

          <NavbarAuth isAuthenticated={Boolean(user?.username)} />
        </div>
        <div className="pointer-events-auto ml-auto flex shrink-0 items-center gap-2 md:gap-3">
          {pathname === "/" && <DiscoverControls />}
          <ThemeSelector />
        </div>
      </div>
    </nav>
  );
}
