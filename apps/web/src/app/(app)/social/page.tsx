import type { Metadata } from "next";

import { SocialView } from "@/features/social/views/social-view";
import { getSession } from "@/shared/lib/session";
import { siteName } from "@/shared/lib/site";

export const instant = false;

const description = "See what the Tsuki community is watching and find people to follow.";

export const metadata: Metadata = {
  title: "Social",
  description,
  openGraph: { title: `Social | ${siteName}`, description, url: "/social" },
};

export default async function Page() {
  const { user } = await getSession();

  return <SocialView isAuthenticated={Boolean(user)} />;
}
