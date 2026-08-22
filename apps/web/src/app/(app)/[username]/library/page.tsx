import { notFound } from "next/navigation";

import { ProfileLibraryView } from "@/features/profile/views/profile-library-view";
import { parseProfileUsername } from "@/features/profile/utils";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const username = parseProfileUsername((await params).username);
  if (!username) notFound();

  return <ProfileLibraryView username={username} />;
}
