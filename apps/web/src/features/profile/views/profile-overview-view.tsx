import { notFound } from "next/navigation";

import { richContentText } from "@tsuki/rich-content";

import { ProfileActivityHeatmap } from "@/features/profile/components/profile-activity-heatmap";
import { ProfileActivityStream } from "@/features/profile/components/profile-activity-stream";
import { ProfileBioCard } from "@/features/profile/components/profile-bio-card";
import { ProfileFavoritesPreview } from "@/features/profile/components/profile-favorites-preview";
import { ProfileStatsLedger } from "@/features/profile/components/profile-stats-ledger";
import { cn } from "@/shared/lib/utils";

import { getProfileOverview } from "../data";

export async function ProfileOverviewView({ username }: { username: string }) {
  const profile = await getProfileOverview(username);
  if (!profile) notFound();

  const bioText = profile.profile?.bio ? richContentText(profile.profile.bio).trim() : "";
  const socialLinks = profile.profile?.socialLinks;
  const hasBio = Boolean(bioText || (socialLinks && Object.keys(socialLinks).length > 0));
  const hasAnimeFavorites = profile.favorites.some((entry) => entry.mediaType === "ANIME");
  const hasMangaFavorites = profile.favorites.some((entry) => entry.mediaType === "MANGA");
  const showLeft = hasBio || hasAnimeFavorites || hasMangaFavorites;

  return (
    <div className="grid grid-cols-1 gap-4 pb-16 md:grid-cols-2 lg:grid-cols-7">
      {showLeft && (
        <div className="contents md:flex md:flex-col md:gap-4 lg:col-span-3">
          {hasBio && <ProfileBioCard className="order-1" profile={profile.profile} />}

          <ProfileFavoritesPreview
            className="order-3"
            favorites={profile.favorites}
            label="Anime"
            mediaType="ANIME"
          />

          <ProfileFavoritesPreview
            className="order-4"
            favorites={profile.favorites}
            label="Manga"
            mediaType="MANGA"
          />
        </div>
      )}

      <div
        className={cn(
          "contents md:flex md:flex-col md:gap-4",
          showLeft ? "lg:col-span-4" : "md:col-span-2 lg:col-span-7",
        )}
      >
        <div className="grid order-2 grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
          <ProfileActivityHeatmap activity={profile.activity} />
          <ProfileStatsLedger stats={profile.stats} />
        </div>

        <ProfileActivityStream className="order-5" username={username} />
      </div>
    </div>
  );
}
