import Image from "next/image";

import type { UserOverview } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

type ProfileAvatarProps = {
  className?: string;
  user: UserOverview["user"];
};

export function ProfileAvatar({ className, user }: ProfileAvatarProps) {
  return (
    <div className={cn("size-20 shrink-0 rounded-full @min-[48rem]:size-24", className)}>
      <div className="relative size-full overflow-hidden rounded-full bg-card">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            fill
            priority
            sizes="(max-width: 768px) 80px, 96px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xl font-medium text-muted-foreground @min-[48rem]:text-2xl">
            {user.displayUsername.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
