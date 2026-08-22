import { notFound } from "next/navigation";

import { ProfileOverviewView } from "@/features/profile/views/profile-overview-view";
import { parseProfileUsername } from "@/features/profile/utils";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const username = parseProfileUsername((await params).username);
  if (!username) notFound();

  return <ProfileOverviewView username={username} />;
}
