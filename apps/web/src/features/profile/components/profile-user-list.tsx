import Link from "next/link";

import type { UserSummary } from "@tsuki/api/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ContentState } from "@/shared/components/content-state";

export function ProfileUserList({
  emptyMessage,
  users,
}: {
  emptyMessage: string;
  users: UserSummary[];
}) {
  if (users.length === 0) return <ContentState title={emptyMessage} />;

  return (
    <ul className="grid gap-3 pb-8 sm:grid-cols-2" aria-label="Users">
      {users.map((user) => (
        <li key={user.id}>
          <Link
            href={`/${user.username}`}
            className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Avatar size="lg">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
              <AvatarFallback>{user.displayUsername.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <span className="block truncate font-medium">
                {user.displayUsername || user.name}
              </span>
              <span className="block truncate text-sm text-muted-foreground">@{user.username}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
