import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProfileLibraryView } from "@/features/profile/views/profile-library-view";
import { parseProfileUsername } from "@/features/profile/utils";
import { Loader } from "@/shared/components/loader";

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  return (
    <Suspense fallback={<Loader />}>
      <LibraryContent params={params} />
    </Suspense>
  );
}

async function LibraryContent({ params }: { params: Promise<{ username: string }> }) {
  const username = parseProfileUsername((await params).username);
  if (!username) notFound();

  return <ProfileLibraryView username={username} />;
}
