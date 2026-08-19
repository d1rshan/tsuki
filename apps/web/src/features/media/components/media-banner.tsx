import Image from "next/image";

import type { MediaType } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

import { mediaImageClass } from "../media";

type MediaBannerProps = {
  image: string | null;
  title: string;
  type: MediaType;
  hasBannerImage: boolean;
};

export function MediaBanner({ image, title, type, hasBannerImage }: MediaBannerProps) {
  function renderImage() {
    if (!image) return null;

    if (hasBannerImage) {
      return (
        <Image
          src={image}
          alt={`${title} banner`}
          fill
          className={cn("object-cover", mediaImageClass(type))}
          priority
          sizes="100vw"
        />
      );
    }

    return (
      <>
        <Image
          src={image}
          alt=""
          fill
          className={cn("scale-110 object-cover blur-xl", mediaImageClass(type))}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-background/30" />
      </>
    );
  }

  return (
    <div className="relative h-[250px] overflow-hidden md:h-[350px]">
      {renderImage()}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
    </div>
  );
}
