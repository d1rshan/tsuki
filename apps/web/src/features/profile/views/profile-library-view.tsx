import { notFound } from "next/navigation";

import type { ListStatus, MediaType } from "@tsuki/api/types";

import { MEDIA } from "@/features/media/media";
import { ContentState } from "@/shared/components/content-state";

import { ProfileFilterLayout } from "../components/profile-filter-layout";
import type { ProfileFilterOption } from "../components/profile-filter-tabs";
import { ProfileMediaGrid } from "../components/profile-library";
import { getProfileLibrary } from "../data";
import { searchParam, type ProfileSearchParams } from "../utils";

const ROUTE: Record<MediaType, string> = { ANIME: "anime-list", MANGA: "manga-list" };

export async function ProfileLibraryView({
  mediaType,
  searchParams,
  username,
}: {
  mediaType: MediaType;
  searchParams: Promise<ProfileSearchParams>;
  username: string;
}) {
  const [entries, params] = await Promise.all([
    getProfileLibrary(username, mediaType),
    searchParams,
  ]);
  if (!entries) notFound();

  const label = MEDIA[mediaType].label;
  if (entries.length === 0)
    return <ContentState title={`This user's ${label.toLowerCase()} library is empty`} />;

  const base = `/${username}/${ROUTE[mediaType]}`;
  const statuses = MEDIA[mediaType].statuses;
  const countFor = (status: ListStatus) =>
    entries.filter((entry) => entry.status === status).length;

  const requested = searchParam(params, "status");
  const requestedValid =
    requested === "ALL" || statuses.some((status) => status.value === requested);
  const firstWithEntries = statuses.find((status) => countFor(status.value) > 0)?.value;
  const selected = requestedValid ? requested! : (firstWithEntries ?? "ALL");
  const visible =
    selected === "ALL" ? entries : entries.filter((entry) => entry.status === selected);

  const options: ProfileFilterOption[] = [
    { value: "ALL", label: "All", href: `${base}?status=ALL`, count: entries.length },
    ...statuses
      .filter((status) => countFor(status.value) > 0)
      .map((status) => ({
        value: status.value,
        label: status.label,
        href: `${base}?status=${status.value}`,
        count: countFor(status.value),
      })),
  ];

  return (
    <ProfileFilterLayout label={`${label} status`} options={options} selected={selected}>
      <ProfileMediaGrid entries={visible} score progress />
    </ProfileFilterLayout>
  );
}
