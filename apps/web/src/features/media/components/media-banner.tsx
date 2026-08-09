import Image from "next/image";

import type { MediaType } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

import { mediaImageClass } from "../media";

export function MediaBanner({
  bannerImage,
  isFallbackImage,
  mediaType,
  title,
}: {
  bannerImage: string | null;
  isFallbackImage: boolean;
  mediaType: MediaType;
  title: string;
}) {
  return (
    <div className="relative h-[250px] w-full overflow-hidden md:h-[350px]">
      {bannerImage && isFallbackImage ? (
        <>
          <Image
            src={bannerImage}
            alt=""
            fill
            className={cn("scale-110 object-cover blur-xl", mediaImageClass(mediaType))}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-background/30" />
        </>
      ) : bannerImage ? (
        <Image
          src={bannerImage}
          alt={`${title} banner`}
          fill
          className={cn("object-cover", mediaImageClass(mediaType))}
          priority
          sizes="100vw"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
    </div>
  );
}
