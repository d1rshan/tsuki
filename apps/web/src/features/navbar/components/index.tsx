"use client";

import { usePathname } from "next/navigation";

import { authClient } from "@tsuki/auth/client";

import { DiscoverControls } from "@/features/discover/components/discover-controls";
import { ThemeSelector } from "@/shared/components/theme-selector";
import { SoftBlurEdge } from "@/shared/components/soft-blur-edge";

import { NavbarLinks } from "./navbar-links";

export type NavbarUser = {
  role?: string | null;
  username?: string | null;
};

export function Navbar() {
  const pathname = usePathname();
  const { data } = authClient.useSession();
  const user: NavbarUser | null = data?.user
    ? { role: data.user.role, username: data.user.username }
    : null;

  return (
    <>
      <nav
        className="group/navbar pointer-events-none fixed inset-x-0 top-0 z-40 pt-6"
        aria-label="Main"
      >
        <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 md:gap-4">
          <div className="pointer-events-auto flex min-w-0 items-center gap-3 md:gap-6">
            <div className="flex min-w-0 items-center overflow-x-auto no-scrollbar">
              <NavbarLinks pathname={pathname} user={user} />
            </div>
          </div>
          <div className="pointer-events-auto ml-auto flex shrink-0 items-center gap-2 md:gap-3">
            {pathname === "/" && (
              <div className="max-md:fixed max-md:bottom-4 max-md:left-1/2 max-md:flex max-md:w-[calc(100vw-2rem)] max-md:-translate-x-1/2 max-md:justify-center">
                <DiscoverControls />
              </div>
            )}
            <ThemeSelector />
          </div>
        </div>
      </nav>
      {pathname === "/" && <SoftBlurEdge edge="bottom" className="md:hidden" />}
    </>
  );
}
