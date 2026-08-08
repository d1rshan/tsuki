import Image from "next/image";

export function MediaBanner({
  bannerImage,
  isFallbackImage,
  title,
}: {
  bannerImage: string | null;
  isFallbackImage: boolean;
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
            className="scale-110 object-cover blur-xl"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-background/30" />
        </>
      ) : bannerImage ? (
        <Image
          src={bannerImage}
          alt={`${title} banner`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
    </div>
  );
}
