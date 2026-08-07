import { notFound } from "next/navigation";

import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { LibrarySection } from "@/features/profile/components/profile-library";
import { ProfileMediaToggle } from "@/features/profile/components/profile-media-toggle";
import { parseUsername } from "@/shared/lib/username";

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

export async function ProfileLibraryPage({ params }: { params: Promise<{ username: string }> }) {
  const username = parseUsername((await params).username);
  if (!username) notFound();

  const entries = await getProfileLibrary(username);
  if (!entries) notFound();

  return (
    <ProfileMediaToggle
      anime={<LibraryForType entries={entries} mediaType="ANIME" />}
      manga={<LibraryForType entries={entries} mediaType="MANGA" />}
    />
  );
}
