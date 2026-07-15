import { notFound } from "next/navigation";

import { LibrarySection } from "@/components/profile/profile-library";
import { getProfileLibrary } from "../queries";

export default async function ProfileLibraryPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { data: library, error } = await getProfileLibrary(username);

  if (error) {
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

  return (
    <div>
      {library.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>This user's library is empty.</p>
        </div>
      )}

      {sections.map((section) => (
        <LibrarySection key={section.title} title={section.title} entries={section.entries} />
      ))}
    </div>
  );
}
