import { Suspense } from "react";

import { resolveUsername } from "@/features/profile/data";
import { Loader } from "@/shared/components/loader";

export function ProfilePage({
  children,
  params,
}: {
  children: (username: string) => React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  return (
    <Suspense fallback={<Loader />}>
      <ResolvedUsername params={params}>{children}</ResolvedUsername>
    </Suspense>
  );
}

async function ResolvedUsername({
  children,
  params,
}: {
  children: (username: string) => React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const username = resolveUsername((await params).username);
  return <>{children(username)}</>;
}
