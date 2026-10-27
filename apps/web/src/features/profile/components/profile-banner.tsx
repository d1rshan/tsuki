import Image from "next/image";

export function ProfileBanner({ bannerImage }: { bannerImage?: string | null }) {
  return (
    <div className="relative h-full min-h-40 min-w-0 overflow-hidden rounded-xl bg-background/40 @min-[48rem]:min-h-48">
      {bannerImage && (
        <Image
          src={bannerImage}
          alt=""
          fill
          preload
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 65vw, (max-width: 1024px) 75vw, 780px"
        />
      )}
    </div>
  );
}
