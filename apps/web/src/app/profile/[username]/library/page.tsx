import { notFound } from "next/navigation";

import type { LibraryEntry, MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/modules/media/config";
import { LibrarySection } from "@/modules/profile/components/profile-library";
import { ProfileMediaToggle } from "@/modules/profile/components/profile-media-toggle";
import { getProfileLibrary } from "@/modules/profile/queries";

/** Sections follow the configured status order, with per-type labels. */
function LibraryForType({ entries, mediaType }: { entries: LibraryEntry[]; mediaType: MediaType }) {
  const forType = entries.filter((entry) => entry.mediaType === mediaType);

  if (forType.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>This user&apos;s {MEDIA[mediaType].label.toLowerCase()} library is empty.</p>
      </div>
    );
  }

  return MEDIA[mediaType].statuses.map(({ value, label }) => (
    <LibrarySection
      key={value}
      title={label}
      entries={forType.filter((entry) => entry.status === value)}
    />
  ));
}

export default async function ProfileLibraryPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { data, error } = await getProfileLibrary(username);

  if (error || !data) return notFound();

  return (
    <ProfileMediaToggle
      anime={<LibraryForType entries={data} mediaType="ANIME" />}
      manga={<LibraryForType entries={data} mediaType="MANGA" />}
    />
  );
}
