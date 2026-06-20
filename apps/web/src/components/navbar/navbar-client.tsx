"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { signOut } from "@/lib/auth-client";

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
              <NavbarLogo />
              <div className="flex items-center gap-1">
                {isHomePage && <NavbarSearchButton onClick={openSearch} />}
                <NavbarAuth username={username} />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavbarAuth({ username }: { username: string | null }) {
  const router = useRouter();

  if (username) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="font-semibold"
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
        >
          LOGOUT
        </Button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      prefetch
      className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/85 transition hover:text-white"
    >
      Login
    </Link>
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
      <Kbd className="hidden sm:flex">Esc</Kbd>
      <Button variant="ghost" size="icon" onClick={onClose} className={"sm:hidden"}>
        <X className="size-4" />
      </Button>
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
