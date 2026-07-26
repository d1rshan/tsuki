import { notFound } from "next/navigation";

import { LibrarySection, MangaLibrarySection } from "@/components/profile/profile-library";
import { getProfileLibrary, getProfileMangaLibrary } from "../queries";

export default async function ProfileLibraryPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [{ data: library, error: libraryError }, { data: mangaLibrary, error: mangaLibraryError }] =
    await Promise.all([getProfileLibrary(username), getProfileMangaLibrary(username)]);

  if (libraryError || mangaLibraryError) {
    return notFound();
  }

  // Group by status
  const watching = library.filter((e) => e.status === "WATCHING");
  const completed = library.filter((e) => e.status === "COMPLETED");
  const planToWatch = library.filter((e) => e.status === "PLAN_TO_WATCH");
  const paused = library.filter((e) => e.status === "PAUSED");
  const dropped = library.filter((e) => e.status === "DROPPED");

  const sections = [
    { title: "Watching", entries: watching },
    { title: "Completed", entries: completed },
    { title: "Plan to Watch", entries: planToWatch },
    { title: "Paused", entries: paused },
    { title: "Dropped", entries: dropped },
  ];

  const reading = mangaLibrary.filter((e) => e.status === "READING");
  const mangaCompleted = mangaLibrary.filter((e) => e.status === "COMPLETED");
  const planToRead = mangaLibrary.filter((e) => e.status === "PLAN_TO_READ");
  const mangaPaused = mangaLibrary.filter((e) => e.status === "PAUSED");
  const mangaDropped = mangaLibrary.filter((e) => e.status === "DROPPED");

  const mangaSections = [
    { title: "Reading", entries: reading },
    { title: "Completed", entries: mangaCompleted },
    { title: "Plan to Read", entries: planToRead },
    { title: "Paused", entries: mangaPaused },
    { title: "Dropped", entries: mangaDropped },
  ];

  return (
    <div>
      {library.length === 0 && mangaLibrary.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>This user's library is empty.</p>
        </div>
      )}

      {library.length > 0 && (
        <div className="mb-4">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Anime</h2>
          {sections.map((section) => (
            <LibrarySection key={section.title} title={section.title} entries={section.entries} />
          ))}
        </div>
      )}

      {mangaLibrary.length > 0 && (
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Manga</h2>
          {mangaSections.map((section) => (
            <MangaLibrarySection
              key={section.title}
              title={section.title}
              entries={section.entries}
            />
          ))}
        </div>
      )}
    </div>
  );
}
