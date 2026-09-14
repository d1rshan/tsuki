import Image from "next/image";

import { cn } from "@/shared/lib/utils";

type ProfileBannerProps = {
  bannerImage?: string | null;
  className?: string;
};

/**
 * The plate's cover. No own rounding/margin — the header plate clips it.
 * Without an image it falls back to the shelf texture: a faint ledger dot-grid
 * with a soft primary glow, so the default still reads as intentional.
 */
export function ProfileBanner({ bannerImage, className }: ProfileBannerProps) {
  return (
    <div
      className={cn(
        "relative h-32 w-full overflow-hidden @min-[48rem]:h-48 @min-[64rem]:h-56",
        className,
      )}
    >
      {bannerImage ? (
        <Image
          src={bannerImage}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="(max-width: 1152px) 100vw, 1152px"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-muted/40">
          <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute -top-24 -right-16 size-64 rounded-full bg-primary/15 blur-3xl" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
    </div>
  );
}
