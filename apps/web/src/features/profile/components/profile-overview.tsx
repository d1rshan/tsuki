import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import type { LibraryEntry } from "@tsuki/api/types";

import {
  MEDIA,
  getMediaCoverImage,
  getMediaTitle,
  mediaHref,
  statusLabel,
} from "@/features/media/media";

import { ProfileMediaCard } from "./profile-media-card";

export function FavoritesSection({
  title,
  favorites,
}: {
  title: string;
  favorites: LibraryEntry[];
}) {
  if (favorites.length === 0) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {favorites.map((entry) => {
          if (!entry.media) return null;
          return (
            <ProfileMediaCard
              key={`${entry.mediaType}-${entry.mediaId}`}
              media={entry.media}
              mediaType={entry.mediaType}
            />
          );
        })}
      </div>
    </section>
  );
}

export function RecentActivitySection({
  title,
  recentLogs,
  username,
}: {
  title: string;
  recentLogs: LibraryEntry[];
  username: string;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Link
          href={`/profile/${username}/library`}
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          View Library
          <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
        </Link>
      </div>

      <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
        {recentLogs.length > 0 ? (
          recentLogs.map((entry) => (
            <RecentLogItem key={`${entry.mediaType}-${entry.mediaId}`} entry={entry} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-sm font-medium text-muted-foreground">
            No recent activity.
          </div>
        )}
      </div>
    </section>
  );
}

function RecentLogItem({ entry }: { entry: LibraryEntry }) {
  if (!entry.media) return null;

  const cover = getMediaCoverImage(entry.media);
  const title = getMediaTitle(entry.media);

  return (
    <Link
      href={mediaHref(entry.mediaType, entry.mediaId)}
      className="group -m-2 flex items-start gap-4 rounded-2xl p-2 transition-colors hover:bg-muted/50"
    >
      <div className="relative w-16 aspect-[3/4] shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm transition-transform duration-500 group-hover:shadow-md group-hover:scale-105">
        {cover ? (
          <Image src={cover} alt={title} fill sizes="64px" className="object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50" />
        )}
      </div>
      <div className="flex flex-1 flex-col py-1">
        <h3 className="line-clamp-2 text-base font-semibold text-foreground/90 transition-colors group-hover:text-primary">
          {title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-muted-foreground">
          {entry.status && (
            <span className="text-foreground/70">{statusLabel(entry.mediaType, entry.status)}</span>
          )}
          {entry.progress > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              {MEDIA[entry.mediaType].unitAbbrev} {entry.progress}
            </span>
          )}
          {entry.score && (
            <span className="flex items-center gap-1 text-amber-500">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30 text-muted-foreground" />
              <Star className="ml-1.5 h-3.5 w-3.5 fill-current" />
              {entry.score}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
