import Image from "next/image";

import type { UserOverview } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

type ProfileAvatarProps = {
  className?: string;
  user: UserOverview["user"];
};

export function ProfileAvatar({ className, user }: ProfileAvatarProps) {
  return (
    <div
      className={cn(
        "relative size-20 shrink-0 overflow-hidden rounded-full border border-border/70 bg-muted shadow-sm ring-4 ring-card @min-[48rem]:size-28",
        className,
      )}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name}
          fill
          priority
          sizes="(max-width: 768px) 80px, 112px"
          className="object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-2xl font-medium text-muted-foreground @min-[48rem]:text-3xl">
          {user.displayUsername.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
