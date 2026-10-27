import Image from "next/image";

import type { UserOverview } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

type ProfileAvatarProps = {
  className?: string;
  user: UserOverview["user"];
};

export function ProfileAvatar({ className, user }: ProfileAvatarProps) {
  return (
    <div className={cn("size-16 shrink-0 rounded-full @min-[48rem]:size-20", className)}>
      <div className="relative size-full overflow-hidden rounded-full bg-card">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            fill
            preload
            sizes="(max-width: 768px) 64px, 80px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-lg font-medium text-muted-foreground @min-[48rem]:text-xl">
            {user.displayUsername.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
