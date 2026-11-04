import { ImageResponse } from "next/og";

import { richContentText } from "@tsuki/rich-content";

import { getMediaOgFonts } from "@/features/media/og-fonts";
import { OgCard } from "@/shared/components/og-card";
import { buildProfileOgCard } from "@/shared/lib/og-card";
import { siteName } from "@/shared/lib/site";

import { getProfileOverview } from "./data";

export async function renderProfileOgImage(username: string) {
  const profile = await getProfileOverview(username);
  const layout = profile
    ? buildProfileOgCard({
        displayUsername: profile.user.displayUsername,
        bio: profile.locked ? null : richContentText(profile.profile?.bio).trim() || null,
        avatarUrl: profile.user.image,
        bannerUrl: profile.locked ? null : profile.profile?.bannerImage,
      })
    : buildProfileOgCard({ displayUsername: siteName, bio: null });

  return new ImageResponse(<OgCard layout={layout} />, {
    width: 1200,
    height: 630,
    fonts: await getMediaOgFonts(),
  });
}
