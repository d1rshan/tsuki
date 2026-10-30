import Link from "next/link";
import { Bug } from "lucide-react";
import { siDiscord, siGithub } from "simple-icons";

// import { Clock } from "@/shared/components/clock";

const GITHUB_URL = "https://github.com/d1rshan/tsuki";
const GITHUB_ISSUES_URL = "https://github.com/d1rshan/tsuki/issues";
const DISCORD_URL = "https://discord.gg/22rFFr8n";
const FOOTER_LINK_CLASS =
  "inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function Footer() {
  return (
    <footer className="px-4 pt-12 pb-24 md:pb-8" aria-label="Site footer">
      <div className="mx-auto max-w-5xl rounded-2xl bg-muted px-6 py-6 md:px-10 md:py-8">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center">
            <span className="font-heading text-3xl font-semibold tracking-[-0.07em] text-foreground">
              tsuki
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
            Keep track of what you watch, share what you love, and find your next favorite.
          </p>
        </div>

        {/* <Clock /> */}
        <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 text-xs text-muted-foreground">
          <span>© 2026 tsuki</span>
          <nav className="flex items-center justify-center" aria-label="Footer navigation">
            <a
              className={FOOTER_LINK_CLASS}
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              title="GitHub repository"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                <path d={siGithub.path} />
              </svg>
            </a>
            <a
              className={FOOTER_LINK_CLASS}
              href={GITHUB_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Report an issue"
              title="Report an issue"
            >
              <Bug className="size-4" aria-hidden="true" />
            </a>
            <a
              className={FOOTER_LINK_CLASS}
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              title="Discord"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                <path d={siDiscord.path} />
              </svg>
            </a>
          </nav>
          <span className="text-right">
            Built by{" "}
            <a
              href="https://github.com/d1rshan"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors hover:text-foreground"
            >
              d1rshan
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
