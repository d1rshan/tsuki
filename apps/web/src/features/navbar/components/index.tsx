"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ThemeToggle } from "@/shared/components/theme-toggle";

import { useNavbarSearch } from "../hooks/use-navbar-search";
import { NavbarAuth } from "./navbar-auth";
import { NavbarLinks } from "./navbar-links";
import { NavbarSearch } from "./navbar-search";

export type NavbarUser = {
  role?: string | null;
  username?: string | null;
};

export function Navbar({ user }: { user: NavbarUser | null }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const search = useNavbarSearch();

  useLayoutEffect(() => () => setIsMobileMenuOpen(false), []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-4 md:pt-6" aria-label="Main">
      <div className="container mx-auto px-4 xl:max-w-5xl">
        <div className="pointer-events-auto relative flex h-12 w-full items-center justify-between rounded-xl border border-black/5 bg-background px-3 shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-background/55 dark:backdrop-blur-2xl md:h-14 md:px-6">
          {search.isOpen ? (
            <NavbarSearch
              mediaType={search.mediaType}
              query={search.query}
              onChange={(value) => void search.setQuery(value || null)}
              onClose={search.close}
            />
          ) : (
            <>
              <div className="mr-auto flex items-center gap-6 md:gap-8">
                <Link href="/" className="group flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground transition-all duration-300 group-hover:scale-[1.5]" />
                  <span className="text-base font-black uppercase tracking-tighter md:text-lg">
                    TSUKI
                  </span>
                </Link>
                <div className="hidden items-center gap-6 sm:flex">
                  <NavbarLinks pathname={pathname} user={user} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 sm:flex">
                  <NavbarAuth isAuthenticated={Boolean(user?.username)} />
                  <div className="mx-1 h-4 w-px bg-border" />
                  <ThemeToggle />
                </div>
                {search.isSearchable ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={search.open}
                    aria-label="Open search"
                    className="text-muted-foreground hover:!bg-transparent hover:text-foreground"
                  >
                    <Search className="size-4" />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:!bg-transparent hover:text-foreground sm:hidden"
                  onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </Button>
              </div>
            </>
          )}
        </div>

        {isMobileMenuOpen && !search.isOpen ? (
          <div className="pointer-events-auto mt-2 flex flex-col gap-1 rounded-xl border border-black/5 bg-background/95 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-background/80 sm:hidden">
            <NavbarLinks isMobile pathname={pathname} user={user} onNavigate={closeMobileMenu} />
            <div className="my-2 h-px w-full bg-border" />
            <div className="flex items-center justify-between px-1">
              <NavbarAuth
                isAuthenticated={Boolean(user?.username)}
                isMobile
                onNavigate={closeMobileMenu}
              />
              <div className="pr-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
