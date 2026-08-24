import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { LibrarySection } from "@/features/profile/components/profile-library";
import { ProfileMediaToggle } from "@/features/profile/components/profile-media-toggle";
import { Loader } from "@/shared/components/loader";
import { ContentState } from "@/shared/components/content-state";

import { getProfileLibrary } from "../data";

function LibraryForType({ entries, mediaType }: { entries: LibraryEntry[]; mediaType: MediaType }) {
  const matchingEntries = entries.filter((entry) => entry.mediaType === mediaType);

  if (matchingEntries.length === 0) {
    return (
      <ContentState
        title={`This user's ${MEDIA[mediaType].label.toLowerCase()} library is empty`}
      />
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
    <Suspense fallback={<Loader />}>
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
