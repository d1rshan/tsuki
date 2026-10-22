"use client";

import { usePathname } from "next/navigation";

import { authClient } from "@tsuki/auth/client";

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
      className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-4 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-32 before:bg-gradient-to-b before:from-background/80 before:to-transparent before:backdrop-blur-md before:[mask-image:linear-gradient(to_bottom,black,transparent)] md:pt-6"
      aria-label="Main"
    >
      <div className="relative mx-auto flex max-w-6xl justify-center px-4">
        <div className="pointer-events-auto absolute top-0 right-4">
          <ThemeSelector />
        </div>
        <div className="pointer-events-auto relative flex w-fit max-w-full items-center justify-center gap-4 md:gap-6">
          <div className="flex min-w-0 items-center">
            <NavbarLinks pathname={pathname} user={user} />
          </div>

          <NavbarAuth isAuthenticated={Boolean(user?.username)} />
        </div>
      </div>
    </nav>
  );
}
