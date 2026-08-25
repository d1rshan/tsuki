import Link from "next/link";

import { ExternalLink } from "@/shared/components/external-link";

const GITHUB_URL = "https://github.com/d1rshan/tsuki";
const GITHUB_ISSUES_URL = "https://github.com/d1rshan/tsuki/issues";
const AUTHOR_URL = "https://github.com/d1rshan";
const ANILIST_URL = "https://anilist.co";

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden" aria-label="Site footer">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-t from-primary/10 via-primary/3 to-transparent blur-2xl"
      />
      <div className="relative z-10 container mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-12 py-12 md:flex-row md:items-end md:justify-between md:py-16">
          <div className="max-w-sm space-y-5">
            <Link href="/" className="group flex w-fit items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground transition-all duration-300 group-hover:scale-[1.5]" />
              <span className="text-xl font-black uppercase tracking-tighter">TSUKI</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Keep track of what you watch, share what you love, and find your next favorite.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-14 gap-y-8 text-sm" aria-label="Footer navigation">
            <div className="flex flex-col items-start gap-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Explore
              </p>
              <Link className="text-muted-foreground transition-colors hover:text-primary" href="/">
                Discover
              </Link>
              <Link
                className="text-muted-foreground transition-colors hover:text-primary"
                href="/social"
              >
                Social
              </Link>
            </div>

            <div className="flex flex-col items-start gap-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Project
              </p>
              <ExternalLink href={GITHUB_URL}>GitHub</ExternalLink>
              <ExternalLink href={GITHUB_ISSUES_URL}>Report an issue</ExternalLink>
              <ExternalLink href={ANILIST_URL}>Data provided by AniList</ExternalLink>
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-2 pb-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Tsuki</span>
          <span>
            Made by <ExternalLink href={AUTHOR_URL}>d1rshan</ExternalLink>
          </span>
        </div>
      </div>
    </footer>
  );
}
