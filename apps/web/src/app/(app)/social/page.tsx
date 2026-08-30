import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { SocialView } from "@/features/social/views/social-view";
import { getSession } from "@/shared/lib/session";

export const instant = false;

// Gated social area — members' activity never surfaces to strangers via search.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function Page() {
  const { user } = await getSession();
  if (!user) redirect("/login");

  return <SocialView />;
}
