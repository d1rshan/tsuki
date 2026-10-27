import Link from "next/link";

import type { UserSummary } from "@tsuki/api/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

/** The compact person card shared by Find People and a Profile's Social list. */
export function ProfileCard({ user }: { user: UserSummary }) {
  return (
    <Link
      href={`/${user.username}`}
      prefetch={true}
      className="flex flex-col items-center gap-2 rounded-xl text-center outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Avatar className="size-20">
        {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
        <AvatarFallback className="text-lg">
          {user.displayUsername[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="w-full truncate text-sm font-medium">{user.displayUsername}</span>
    </Link>
  );
}
