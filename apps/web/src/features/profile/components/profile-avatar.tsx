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
        "relative h-24 w-24 overflow-hidden rounded-full border bg-muted ring-4 ring-background shadow-sm md:h-32 md:w-32",
        className,
      )}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name}
          fill
          priority
          sizes="(max-width: 768px) 96px, 128px"
          className="object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-3xl font-medium text-muted-foreground">
          {user.displayUsername.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
