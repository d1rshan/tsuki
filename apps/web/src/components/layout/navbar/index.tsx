"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { signOut } from "@tsuki/auth/client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

import { useNavbarSearch } from "./use-navbar-search";

type UserData = {
  username?: string | null;
  role?: string | null;
};

export function Navbar({ user }: { user: UserData | null }) {
  const username = user?.username ?? null;
  const role = user?.role ?? null;

  const { query, setQuery, isOpen, openSearch, closeSearch, isSearchablePage, mediaType } =
    useNavbarSearch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-40 pointer-events-none pt-4 md:pt-6">
      <div className="container mx-auto px-4 xl:max-w-5xl">
        <div className="pointer-events-auto relative flex h-12 w-full items-center justify-between rounded-xl border border-black/5 dark:border-white/10 bg-background dark:bg-background/55 px-3 shadow-2xl dark:backdrop-blur-2xl transition-all duration-300 md:h-14 md:px-6">
          {isOpen && isSearchablePage ? (
            <NavbarSearchInput
              query={query}
              setQuery={setQuery}
              onClose={closeSearch}
              mediaType={mediaType}
            />
          ) : (
            <>
              <div className="mr-auto flex items-center gap-6 md:gap-8">
                <NavbarLogo />
                <div className="hidden items-center gap-6 sm:flex">
                  <NavbarLinks username={username} role={role} />
                </div>
              </div>
              {/* Right Side: Auth & Search Action */}
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 sm:flex">
                  <NavbarAuth username={username} />
                  <div className="mx-1 h-4 w-[1px] bg-border" />
                  <ThemeToggle />
                </div>

                {isSearchablePage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openSearch}
                    className="text-muted-foreground hover:!bg-transparent hover:text-foreground"
                  >
                    <Search className="size-4" />
                  </Button>
                )}

                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden text-muted-foreground hover:!bg-transparent hover:text-foreground"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && !isOpen && (
          <div className="pointer-events-auto absolute left-4 right-4 top-[calc(100%+0.5rem)] rounded-xl border border-black/5 dark:border-white/10 bg-background/95 p-3 shadow-2xl backdrop-blur-2xl dark:bg-background/80 sm:hidden">
            <div className="flex flex-col gap-1">
              <NavbarLinks username={username} role={role} isMobile />
              <div className="my-2 h-px w-full bg-border" />
              <div className="flex items-center justify-between px-1">
                <NavbarAuth username={username} isMobile />
                <div className="pr-2">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavbarLogo() {
  return (
    <Link href="/" className="group flex items-center gap-2">
      <div className="h-1.5 w-1.5 rounded-full bg-foreground transition-all duration-300 group-hover:scale-[1.5]" />
      <span className="text-base font-black uppercase tracking-tighter md:text-lg">TSUKI</span>
    </Link>
  );
}

function NavLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/link inline-flex items-center py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 hover:text-foreground",
        isActive ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span className="relative">
        {children}
        <span
          className={cn(
            "absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300",
            isActive ? "w-full" : "w-0 group-hover/link:w-full",
          )}
        />
      </span>
    </Link>
  );
}

function MobileNavLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center rounded-lg px-3 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300",
        isActive
          ? "bg-foreground/5 text-foreground"
          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function NavbarLinks({
  username,
  role,
  isMobile,
}: {
  username: string | null;
  role: string | null;
  isMobile?: boolean;
}) {
  const pathname = usePathname();
  const LinkComponent = isMobile ? MobileNavLink : NavLink;

  return (
    <>
      <LinkComponent
        href="/"
        isActive={pathname === "/" || pathname.includes("anime") || pathname.includes("manga")}
      >
        Discover
      </LinkComponent>

      {username && (
        <LinkComponent
          href={`/profile/${username}`}
          isActive={!!pathname?.startsWith(`/profile/${username}`)}
        >
          Profile
        </LinkComponent>
      )}

      {(role === "admin" || role === "owner") && (
        <LinkComponent href="/admin" isActive={!!pathname?.startsWith("/admin")}>
          Admin
        </LinkComponent>
      )}
    </>
  );
}

function NavbarAuth({ username, isMobile }: { username: string | null; isMobile?: boolean }) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (username) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoggingOut}
        className={cn(
          "font-black text-xs uppercase tracking-widest text-muted-foreground hover:!bg-transparent hover:text-foreground",
          isMobile && "justify-start px-2 py-3",
        )}
        onClick={async () => {
          setIsLoggingOut(true);
          try {
            await signOut();
            window.location.href = "/";
          } catch {
            setIsLoggingOut(false);
          }
        }}
      >
        {isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}
      </Button>
    );
  }

  const loginHref = "/login";

  if (isMobile) {
    return (
      <MobileNavLink href={loginHref} isActive={pathname === loginHref}>
        Login
      </MobileNavLink>
    );
  }

  return (
    <NavLink href={loginHref} isActive={pathname === loginHref}>
      Login
    </NavLink>
  );
}

interface NavbarSearchInputProps {
  query: string;
  setQuery: (val: string) => void;
  onClose: () => void;
  mediaType: "ANIME" | "MANGA";
}

function NavbarSearchInput({ query, setQuery, onClose, mediaType }: NavbarSearchInputProps) {
  return (
    <div className="flex h-full w-full items-center gap-3">
      <Search className="size-5 text-muted-foreground" />
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${mediaType}...`}
        className="h-full flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button onClick={onClose} className="transition-opacity hover:opacity-80">
        <Kbd>Esc</Kbd>
      </button>
    </div>
  );
}
