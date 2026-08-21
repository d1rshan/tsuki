import { redirect } from "next/navigation";

import { FriendsView } from "@/features/friends/views/friends-view";
import { getSession } from "@/shared/lib/session";

export const instant = false;

export default async function Page() {
  const { user } = await getSession();
  if (!user) redirect("/login");

  return <FriendsView />;
}
