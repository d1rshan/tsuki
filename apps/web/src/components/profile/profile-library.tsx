import { ProfileAnimeCard } from "@/components/profile/profile-anime-card";
import { ProfileMangaCard } from "@/components/profile/profile-manga-card";
import type { LibraryEntry, MangaLibraryEntry } from "@/lib/types";

export function LibrarySection({ title, entries }: { title: string; entries: LibraryEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight mb-6">
        {title}
        <span className="text-muted-foreground text-lg font-normal ml-2">({entries.length})</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
        {entries.map((entry) => {
          if (!entry.anime) return null;
          return (
            <ProfileAnimeCard
              key={entry.animeId}
              anime={entry.anime}
              rating={entry.rating}
              episodesWatched={entry.episodesWatched}
            />
          );
        })}
      </div>
    </section>
  );
}

export function MangaLibrarySection({
  title,
  entries,
}: {
  title: string;
  entries: MangaLibraryEntry[];
}) {
  if (entries.length === 0) return null;
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight mb-6">
        {title}
        <span className="text-muted-foreground text-lg font-normal ml-2">({entries.length})</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
        {entries.map((entry) => {
          if (!entry.manga) return null;
          return (
            <ProfileMangaCard
              key={entry.mangaId}
              manga={entry.manga}
              rating={entry.rating}
              chaptersRead={entry.chaptersRead}
            />
          );
        })}
      </div>
    </section>
  );
}
