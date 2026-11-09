import Image from "next/image";

export function ProfileBanner({ bannerImage }: { bannerImage?: string | null }) {
  return (
    <div className="relative left-1/2 h-[250px] w-dvw -translate-x-1/2 overflow-hidden bg-muted md:h-[350px]">
      {bannerImage && (
        <Image
          src={bannerImage}
          alt=""
          fill
          preload
          unoptimized
          className="object-cover"
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
    </div>
  );
}
