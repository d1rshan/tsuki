import { ImageResponse } from "next/og";

import { richContentText } from "@tsuki/rich-content";

import { getProfileOverview } from "@/features/profile/data";
import { OgCard } from "@/shared/components/og-card";
import { buildProfileOgCard } from "@/shared/lib/og-card";
import { siteName } from "@/shared/lib/site";

export const alt = "Profile card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const profile = await getProfileOverview((await params).username);

  if (!profile) {
    return new ImageResponse(
      <OgCard layout={buildProfileOgCard({ displayUsername: siteName, bio: null })} />,
      size,
    );
  }

  return new ImageResponse(
    <OgCard
      layout={buildProfileOgCard({
        displayUsername: profile.user.displayUsername,
        bio: richContentText(profile.profile?.bio).trim() || null,
      })}
    />,
    size,
  );
}
