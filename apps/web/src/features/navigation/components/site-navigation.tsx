"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/shared/components/theme-toggle";

import { useNavigationSearch } from "../hooks/use-navigation-search";
import { NavigationAuth } from "./navigation-auth";
import { NavigationLinks } from "./navigation-links";
import { NavigationSearch } from "./navigation-search";

export type NavigationUser = {
  role?: string | null;
  username?: string | null;
};

export function SiteNavigation({ user }: { user: NavigationUser | null }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const search = useNavigationSearch();

  useLayoutEffect(() => () => setIsMobileMenuOpen(false), []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-4 md:pt-6" aria-label="Main">
      <div className="container mx-auto px-4 xl:max-w-5xl">
        <div className="pointer-events-auto relative flex h-12 items-center justify-between rounded-lg border bg-background/95 px-3 shadow-lg backdrop-blur-md md:h-14 md:px-5">
          {search.isOpen ? (
            <NavigationSearch
              mediaType={search.mediaType}
              query={search.query}
              onChange={(value) => void search.setQuery(value || null)}
              onClose={search.close}
            />
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-6 md:gap-8">
                <Link href="/" className="flex shrink-0 items-center gap-2 font-black uppercase">
                  <span className="size-1.5 rounded-full bg-foreground" />
                  Tsuki
                </Link>
                <div className="hidden items-center gap-6 sm:flex">
                  <NavigationLinks pathname={pathname} user={user} />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="hidden items-center gap-1 sm:flex">
                  <NavigationAuth isAuthenticated={Boolean(user?.username)} />
                  <ThemeToggle />
                </div>
                {search.isSearchable ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={search.open}
                    aria-label="Open search"
                  >
                    <Search />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? <X /> : <Menu />}
                </Button>
              </div>
            </>
          )}
        </div>

        {isMobileMenuOpen && !search.isOpen ? (
          <div className="pointer-events-auto mt-2 flex flex-col gap-1 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur-md sm:hidden">
            <NavigationLinks
              isMobile
              pathname={pathname}
              user={user}
              onNavigate={closeMobileMenu}
            />
            <div className="my-2 h-px bg-border" />
            <div className="flex items-center justify-between gap-2">
              <NavigationAuth isAuthenticated={Boolean(user?.username)} />
              <ThemeToggle />
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
