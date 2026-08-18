import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { LibrarySection } from "@/features/profile/components/profile-library";
import { ProfileMediaToggle } from "@/features/profile/components/profile-media-toggle";
import { LoadingIndicator } from "@/shared/components/loading-indicator";

import { getProfileLibrary } from "../data";

function LibraryForType({ entries, mediaType }: { entries: LibraryEntry[]; mediaType: MediaType }) {
  const matchingEntries = entries.filter((entry) => entry.mediaType === mediaType);

  if (matchingEntries.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">
        This user&apos;s {MEDIA[mediaType].label.toLowerCase()} library is empty.
      </p>
    );
  }

  return MEDIA[mediaType].statuses.map(({ value, label }) => (
    <LibrarySection
      key={value}
      title={label}
      entries={matchingEntries.filter((entry) => entry.status === value)}
    />
  ));
}

export function ProfileLibraryView({ username }: { username: string }) {
  return (
    <Suspense fallback={<LoadingIndicator label="Loading library" />}>
      <ProfileLibraryContent username={username} />
    </Suspense>
  );
}

async function ProfileLibraryContent({ username }: { username: string }) {
  const entries = await getProfileLibrary(username);
  if (!entries) notFound();

  return (
    <ProfileMediaToggle
      anime={<LibraryForType entries={entries} mediaType="ANIME" />}
      manga={<LibraryForType entries={entries} mediaType="MANGA" />}
    />
  );
}
