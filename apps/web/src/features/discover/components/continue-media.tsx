import { BookOpen, Play } from "lucide-react";

import type { MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { getProfileLibrary } from "@/features/profile/data";
import { getSession } from "@/shared/lib/session";

import { getContinueEntries, type ContinueEntry } from "../continue-media";
import { ContinueMediaCard } from "./continue-media-card";

const DISPLAY_LIMIT = 4;

export async function ContinueMedia() {
  const { user } = await getSession();
  if (!user?.username) return null;

  try {
    const entries = (await getProfileLibrary(user.username, { status: "CURRENT" })) ?? [];

    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <ContinueList
          entries={getContinueEntries(entries, "ANIME", DISPLAY_LIMIT)}
          mediaType="ANIME"
        />
        <ContinueList
          entries={getContinueEntries(entries, "MANGA", DISPLAY_LIMIT)}
          mediaType="MANGA"
        />
      </div>
    );
  } catch {
    return (
      <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
        Your in-progress library couldn&apos;t be loaded right now.
      </p>
    );
  }
}

function ContinueList({ entries, mediaType }: { entries: ContinueEntry[]; mediaType: MediaType }) {
  const isAnime = mediaType === "ANIME";
  const Icon = isAnime ? Play : BookOpen;
  const title = `Continue ${isAnime ? "Watching" : "Reading"}`;

  return (
    <section aria-label={title} className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Icon className="size-4" fill={isAnime ? "currentColor" : "none"} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Your {MEDIA[mediaType].label}
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="grid gap-3">
          {entries.map((entry) => (
            <ContinueMediaCard key={entry.mediaId} media={entry.media} progress={entry.progress} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed bg-card/30 px-4 text-center text-sm text-muted-foreground">
          Nothing in progress. Start something from your library when you&apos;re ready.
        </div>
      )}
    </section>
  );
}
