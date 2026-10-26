import type { ReactNode } from "react";
import Image from "next/image";

import { ProgressiveBlur } from "@/shared/components/ui/progressive-blur";
import { cn } from "@/shared/lib/utils";

export function ProfileBanner({
  bannerImage,
  children,
}: {
  bannerImage?: string | null;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex items-end overflow-hidden rounded-xl border border-muted bg-muted",
        bannerImage && "min-h-48 @min-[48rem]:min-h-56 @min-[64rem]:min-h-64",
      )}
    >
      {bannerImage && (
        <>
          <Image
            src={bannerImage}
            alt=""
            fill
            priority
            unoptimized
            className="object-cover"
            sizes="(max-width: 1152px) 100vw, 1152px"
          />
          <ProgressiveBlur className="absolute inset-x-0 bottom-0 h-20" blurIntensity={0.4} />
        </>
      )}
      {children}
    </div>
  );
}
