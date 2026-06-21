"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { useNavbarSearch } from "./use-navbar-search";

export function NavbarClient({ username }: { username: string | null }) {
  const { query, setQuery, isOpen, openSearch, closeSearch, isHomePage } = useNavbarSearch();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 pointer-events-none pt-4 md:pt-6">
      <div className="container mx-auto px-4 xl:max-w-5xl">
        <div className="pointer-events-auto relative flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-background/55 px-3 shadow-2xl backdrop-blur-2xl transition-all duration-300 md:h-14 md:px-6">
          {isOpen && isHomePage ? (
            <NavbarSearchInput query={query} setQuery={setQuery} onClose={closeSearch} />
          ) : (
            <>
              <div className="flex items-center gap-6 md:gap-8 mr-auto">
                <NavbarLogo />
                <NavbarLinks username={username} />
              </div>
              <div className="flex items-center gap-2">
                <NavbarAuth username={username} />
                {isHomePage && (
                  <>
                    <div className="hidden h-4 w-[1px] bg-border mx-1 sm:block" />
                    <NavbarSearchButton onClick={openSearch} />
                  </>
                )}
              </div>
            </>
          )}
        </div>
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

function NavbarLinks({ username }: { username: string | null }) {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-6 sm:flex">
      <NavLink href="/" isActive={pathname === "/"}>
        Discover
      </NavLink>

      {username && (
        <NavLink
          href={`/profile/${username}`}
          isActive={!!pathname?.startsWith(`/profile/${username}`)}
        >
          Profile
        </NavLink>
      )}
    </div>
  );
}

function NavbarAuth({ username }: { username: string | null }) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (username) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoggingOut}
        className="font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        onClick={async () => {
          setIsLoggingOut(true);
          try {
            await signOut();
            window.location.href = "/";
          } catch (e) {
            setIsLoggingOut(false);
          }
        }}
      >
        {isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}
      </Button>
    );
  }

  const loginHref = "/login";

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
}

function NavbarSearchInput({ query, setQuery, onClose }: NavbarSearchInputProps) {
  return (
    <div className="flex h-full w-full items-center gap-3">
      <Search className="size-5 text-muted-foreground" />
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search anime..."
        className="h-full flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button onClick={onClose} className="transition-opacity hover:opacity-80">
        <Kbd>Esc</Kbd>
      </button>
    </div>
  );
}

function NavbarSearchButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick}>
      <Search className="size-4" />
    </Button>
  );
}
