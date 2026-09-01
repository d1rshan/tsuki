import Image from "next/image";

import { cn } from "@/shared/lib/utils";

type ProfileBannerProps = {
  bannerImage?: string | null;
  className?: string;
};

export function ProfileBanner({ bannerImage, className }: ProfileBannerProps) {
  return (
    <div className={cn("relative mb-6 w-full overflow-hidden rounded-2xl border", className)}>
      {bannerImage ? (
        <div className="relative h-48 w-full overflow-hidden shadow-sm md:h-64">
          <Image
            src={bannerImage}
            alt="Banner"
            fill
            priority
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-tr from-muted/50 via-muted/20 to-muted/50 md:h-64" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
    </div>
  );
}
