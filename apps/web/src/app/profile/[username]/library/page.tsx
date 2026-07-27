import { notFound } from "next/navigation";

import { LibrarySection } from "@/components/profile/profile-library";
import { ProfileMediaToggle } from "@/components/profile/profile-media-toggle";
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
  const sections = [
    { title: "Watching", entries: library.filter((e) => e.status === "WATCHING") },
    { title: "Completed", entries: library.filter((e) => e.status === "COMPLETED") },
    { title: "Plan to Watch", entries: library.filter((e) => e.status === "PLAN_TO_WATCH") },
    { title: "Paused", entries: library.filter((e) => e.status === "PAUSED") },
    { title: "Dropped", entries: library.filter((e) => e.status === "DROPPED") },
  ];

  const mangaSections = [
    { title: "Reading", entries: mangaLibrary.filter((e) => e.status === "READING") },
    { title: "Completed", entries: mangaLibrary.filter((e) => e.status === "COMPLETED") },
    { title: "Plan to Read", entries: mangaLibrary.filter((e) => e.status === "PLAN_TO_READ") },
    { title: "Paused", entries: mangaLibrary.filter((e) => e.status === "PAUSED") },
    { title: "Dropped", entries: mangaLibrary.filter((e) => e.status === "DROPPED") },
  ];

  const animeContent =
    library.length === 0 ? (
      <div className="text-center py-20 text-muted-foreground">
        <p>This user's anime library is empty.</p>
      </div>
    ) : (
      sections.map((section) => (
        <LibrarySection key={section.title} title={section.title} entries={section.entries} />
      ))
    );

  const mangaContent =
    mangaLibrary.length === 0 ? (
      <div className="text-center py-20 text-muted-foreground">
        <p>This user's manga library is empty.</p>
      </div>
    ) : (
      mangaSections.map((section) => (
        <LibrarySection key={section.title} title={section.title} entries={section.entries} />
      ))
    );

  return <ProfileMediaToggle anime={animeContent} manga={mangaContent} />;
}
