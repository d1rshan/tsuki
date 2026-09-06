import { Suspense } from "react";
import type { Metadata } from "next";

import { SocialView } from "@/features/social/views/social-view";
import { getSession } from "@/shared/lib/session";
import { siteName } from "@/shared/lib/site";

const description = "See what the Tsuki community is watching and find people to follow.";

export const metadata: Metadata = {
  title: "Social",
  description,
  openGraph: { title: `Social | ${siteName}`, description, url: "/social" },
};

export default function Page() {
  return (
    <Suspense fallback={<SocialView isAuthenticated={false} />}>
      <SocialGate />
    </Suspense>
  );
}

async function SocialGate() {
  const { user } = await getSession();

  return <SocialView isAuthenticated={Boolean(user)} />;
}
