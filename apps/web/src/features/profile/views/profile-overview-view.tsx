import { notFound } from "next/navigation";

import { richContentText } from "@tsuki/rich-content";

import { ProfileActivityHeatmap } from "@/features/profile/components/profile-activity-heatmap";
import { ProfileActivityStream } from "@/features/profile/components/profile-activity-stream";
import { ProfileBioCard } from "@/features/profile/components/profile-bio-card";
import { ProfileFavoritesPreview } from "@/features/profile/components/profile-favorites-preview";
import { ProfileStatsLedger } from "@/features/profile/components/profile-stats-ledger";

import { getProfileOverview } from "../data";

export async function ProfileOverviewView({ username }: { username: string }) {
  const profile = await getProfileOverview(username);
  if (!profile) notFound();

  const bioText = profile.profile?.bio ? richContentText(profile.profile.bio).trim() : "";
  const socialLinks = profile.profile?.socialLinks;
  const hasBio = Boolean(bioText || (socialLinks && Object.keys(socialLinks).length > 0));

  return (
    <div className="grid grid-cols-1 gap-4 pb-16 md:grid-cols-2 lg:grid-cols-7">
      <div className="flex flex-col gap-4 lg:col-span-3">
        {hasBio && <ProfileBioCard profile={profile.profile} />}

        <ProfileFavoritesPreview favorites={profile.favorites} label="Anime" mediaType="ANIME" />

        <ProfileFavoritesPreview
          className="flex-1"
          favorites={profile.favorites}
          label="Manga"
          mediaType="MANGA"
        />
      </div>

      <div className="flex flex-col gap-4 lg:col-span-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ProfileActivityHeatmap activity={profile.activity} />
          <ProfileStatsLedger stats={profile.stats} />
        </div>

        <ProfileActivityStream username={username} />
      </div>
    </div>
  );
}
