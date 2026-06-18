"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

import { NavbarAuth } from "./navbar-auth";
import { useNavbarSearch } from "./use-navbar-search";

export function Navbar() {
  const { query, setQuery, isOpen, openSearch, closeSearch, isHomePage } = useNavbarSearch();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 pointer-events-none pt-4 md:pt-6">
      <div className="container mx-auto px-4 xl:max-w-5xl">
        <div className="pointer-events-auto relative flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-background/55 px-3 shadow-2xl backdrop-blur-2xl transition-all duration-300 md:h-14 md:px-6">
          {isOpen && isHomePage ? (
            <NavbarSearch query={query} setQuery={setQuery} onClose={closeSearch} />
          ) : (
            <>
              <NavbarLogo />
              <div className="flex items-center gap-3">
                {isHomePage && <NavbarSearchButton onClick={openSearch} />}
                <NavbarAuth />
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
    <Link href="/" className="flex items-center gap-2 group">
      <div className="h-1.5 w-1.5 rounded-full bg-foreground transition-all duration-300 group-hover:scale-[1.5]" />
      <span className="text-base font-black uppercase tracking-tighter md:text-lg">TSUKI</span>
    </Link>
  );
}

interface NavbarSearchProps {
  query: string;
  setQuery: (val: string) => void;
  onClose: () => void;
}

function NavbarSearch({ query, setQuery, onClose }: NavbarSearchProps) {
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
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-sans">
          Esc
        </kbd>
      </div>
    </div>
  );
}

function NavbarSearchButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="h-8 w-8 rounded-full text-foreground/85 md:h-9 md:w-9"
      aria-label="Open search"
    >
      <Search className="size-4" />
    </Button>
  );
}
