import { notFound } from "next/navigation";

import type { MediaType } from "@tsuki/api/types";

import { MEDIA, MEDIA_TYPES } from "@/features/media/media";
import { ContentState } from "@/shared/components/content-state";

import { ProfileFilterLayout } from "../components/profile-filter-layout";
import type { ProfileFilterOption } from "../components/profile-filter-tabs";
import { ProfileMediaGrid } from "../components/profile-library";
import { getProfileLibrary } from "../data";
import { searchParam, type ProfileSearchParams } from "../utils";

export async function ProfileFavoritesView({
  searchParams,
  username,
}: {
  searchParams: Promise<ProfileSearchParams>;
  username: string;
}) {
  const [entries, params] = await Promise.all([getProfileLibrary(username), searchParams]);
  if (!entries) notFound();

  const favorites: Record<MediaType, typeof entries> = {
    ANIME: entries.filter((entry) => entry.mediaType === "ANIME" && entry.isFavorite),
    MANGA: entries.filter((entry) => entry.mediaType === "MANGA" && entry.isFavorite),
  };

  if (favorites.ANIME.length === 0 && favorites.MANGA.length === 0)
    return <ContentState title="No favorites yet" />;

  const requested = searchParam(params, "type");
  const requestedValid = MEDIA_TYPES.some((type) => type === requested);
  const selected: MediaType = requestedValid
    ? (requested as MediaType)
    : favorites.ANIME.length
      ? "ANIME"
      : "MANGA";

  const options: ProfileFilterOption[] = MEDIA_TYPES.map((type) => ({
    value: type,
    label: MEDIA[type].label,
    href: `/${username}/favorites?type=${type}`,
    count: favorites[type].length,
  }));

  return (
    <ProfileFilterLayout label="Favorite media type" options={options} selected={selected}>
      {favorites[selected].length === 0 ? (
        <ContentState title={`No favorite ${MEDIA[selected].label.toLowerCase()} yet`} />
      ) : (
        <ProfileMediaGrid entries={favorites[selected]} />
      )}
    </ProfileFilterLayout>
  );
}
