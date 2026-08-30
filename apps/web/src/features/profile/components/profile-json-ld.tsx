import { richContentText } from "@tsuki/rich-content";

import { siteUrl } from "@/shared/lib/site";

import { getProfileOverview } from "../data";

export async function ProfileJsonLd({ username }: { username: string }) {
  const profile = await getProfileOverview(username);
  if (!profile) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: profile.user.displayUsername,
            alternateName: `@${profile.user.username}`,
            description: richContentText(profile.profile?.bio).trim() || undefined,
            url: `${siteUrl}/${username}`,
          },
        }),
      }}
    />
  );
}
