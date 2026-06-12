import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex h-14 w-full max-w-5xl items-center justify-between rounded-full border border-border/40 bg-background/60 px-6 backdrop-blur-xl shadow-lg dark:shadow-black/40">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            ANILOG
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="rounded-full">
              <Link href="/login">Login</Link>
            </Button>
            <div className="rounded-full overflow-hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
