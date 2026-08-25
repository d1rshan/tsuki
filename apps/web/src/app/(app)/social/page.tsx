import { redirect } from "next/navigation";

import { SocialView } from "@/features/social/views/social-view";
import { getSession } from "@/shared/lib/session";

export const instant = false;

export default async function Page() {
  const { user } = await getSession();
  if (!user) redirect("/login");

  return <SocialView />;
}
