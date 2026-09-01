import { notFound } from "next/navigation";

import type { MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { ContentState } from "@/shared/components/content-state";

import { LibrarySection } from "../components/profile-library";
import { getProfileLibrary } from "../data";

export async function ProfileLibraryView({
  username,
  mediaType,
}: {
  username: string;
  mediaType: MediaType;
}) {
  const entries = await getProfileLibrary(username, mediaType);
  if (!entries) notFound();

  if (entries.length === 0)
    return (
      <ContentState
        title={`This user's ${MEDIA[mediaType].label.toLowerCase()} library is empty`}
      />
    );

  return MEDIA[mediaType].statuses.map(({ value, label }) => (
    <LibrarySection
      key={value}
      title={label}
      entries={entries.filter((entry) => entry.status === value)}
    />
  ));
}
