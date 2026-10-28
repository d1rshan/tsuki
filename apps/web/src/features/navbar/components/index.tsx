"use client";

import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";

import { authClient } from "@tsuki/auth/client";

import { useAuthDialog } from "@/features/auth/hooks/use-auth-dialog";
import { DiscoverControls } from "@/features/discover/components/discover-controls";
import { PeopleSearchControls } from "@/features/social/components/people-search-controls";
import { ThemeSelector } from "@/shared/components/theme-selector";
import { SoftBlurEdge } from "@/shared/components/soft-blur-edge";
import { Button } from "@/shared/components/ui/button";

import { NavbarLinks } from "./navbar-links";

export type NavbarUser = {
  role?: string | null;
  username?: string | null;
};

export function Navbar() {
  const { openAuth } = useAuthDialog();
  const pathname = usePathname();
  const { data, isPending } = authClient.useSession();
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
            <div className="flex min-w-0 items-center">
              <NavbarLinks pathname={pathname} user={user} />
            </div>
          </div>
          {pathname === "/" && (
            <div className="pointer-events-auto absolute left-1/2 top-0 flex -translate-x-1/2 items-center">
              <DiscoverControls mode="switcher" />
            </div>
          )}
          <div className="pointer-events-auto ml-auto flex shrink-0 items-center gap-2 md:gap-3">
            {pathname === "/" && (
              <>
                <div className="md:hidden">
                  <DiscoverControls mode="search" />
                </div>
                <div className="hidden md:flex">
                  <DiscoverControls mode="search" />
                </div>
              </>
            )}
            {pathname === "/social" && (
              <div>
                <PeopleSearchControls />
              </div>
            )}
            <ThemeSelector compactMobile />
            {!isPending && !user && (
              <div className="rounded-full bg-muted p-1">
                <Button
                  variant="ghost"
                  onClick={() => openAuth()}
                  aria-label="Sign in"
                  className="h-auto rounded-full border-0 px-4 py-[7px] hover:bg-transparent hover:text-foreground max-md:size-8.5 max-md:p-0"
                >
                  <LogIn aria-hidden="true" className="md:hidden" />
                  <span className="max-md:hidden">Sign in</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
      {pathname === "/" && <SoftBlurEdge edge="bottom" className="md:hidden" />}
    </>
  );
}
