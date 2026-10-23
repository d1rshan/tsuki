import Link from "next/link";

import { Clock } from "@/shared/components/clock";

const GITHUB_URL = "https://github.com/d1rshan/tsuki";
const GITHUB_ISSUES_URL = "https://github.com/d1rshan/tsuki/issues";
const KITSU_URL = "https://kitsu.app";
const FOOTER_LINK_CLASS =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export function Footer() {
  return (
    <footer className="px-4 pt-12 pb-24 md:pb-8" aria-label="Site footer">
      <div className="mx-auto max-w-5xl rounded-2xl bg-muted px-6 py-8 md:px-10 md:py-10">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex items-center">
              <span className="font-heading text-3xl font-semibold tracking-[-0.07em] text-muted-foreground">
                tsuki
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Keep track of what you watch, share what you love, and find your next favorite.
            </p>
          </div>

          <nav className="flex flex-col items-start gap-3" aria-label="Footer navigation">
            <a
              className={FOOTER_LINK_CLASS}
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              className={FOOTER_LINK_CLASS}
              href={GITHUB_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Report an issue
            </a>
            <a
              className={FOOTER_LINK_CLASS}
              href={KITSU_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Media data from kitsu.app
            </a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 tsuki</span>
          <Clock />
        </div>
      </div>
    </footer>
  );
}
