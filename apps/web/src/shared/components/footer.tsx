import { ExternalLink } from "@/shared/components/external-link";

const GITHUB_URL = "https://github.com/d1rshan/tsuki";
const GITHUB_ISSUES_URL = "https://github.com/d1rshan/tsuki/issues";
const ANILIST_URL = "https://anilist.co";

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden" aria-label="Site footer">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-[radial-gradient(ellipse_at_center_bottom,var(--primary)_0%,transparent_68%)] opacity-[0.05] blur-xl sm:h-40 md:h-48 md:opacity-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-primary/5 via-primary/0 to-transparent sm:h-28 md:h-32"
      />
      <div className="relative container mx-auto max-w-6xl px-4 pt-10 md:pt-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="relative h-[clamp(4rem,14vw,10rem)] min-w-0 flex-1 overflow-hidden">
            <span className="absolute bottom-[-0.04em] left-0 w-max text-left font-sans text-[clamp(4rem,18vw,16rem)] font-black uppercase leading-[0.72] tracking-[-0.02em] text-foreground/20">
              TSUKI
            </span>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1 sm:min-w-36">
            <ExternalLink href={GITHUB_URL}>GitHub</ExternalLink>
            <ExternalLink href={GITHUB_ISSUES_URL}>Report an issue</ExternalLink>
            <ExternalLink href={ANILIST_URL}>Thanks AniList</ExternalLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
