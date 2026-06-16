import Link from "next/link";
import { NavbarAuth } from "./navbar-auth";

export function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex justify-center p-3 md:p-6 pointer-events-none">
      <div className="relative w-full max-w-5xl">
        <div className="pointer-events-auto relative flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-background/55 px-3 shadow-2xl backdrop-blur-2xl md:h-14 md:px-6">
          <div className="flex items-center gap-4 md:gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-1.5 w-1.5 rounded-full bg-foreground transition-all duration-300 group-hover:scale-[1.5]" />
              <span className="text-base font-black uppercase tracking-tighter md:text-lg">
                TSUKI
              </span>
            </Link>
          </div>
          <NavbarAuth />
        </div>
      </div>
    </nav>
  );
}
