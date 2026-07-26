import Image from "next/image";

export function MangaBanner({ bannerImage, title }: { bannerImage: string | null; title: string }) {
  if (!bannerImage) {
    return <div className="relative h-[250px] w-full overflow-hidden md:h-[350px]" />;
  }

  return (
    <div className="relative h-[250px] w-full overflow-hidden md:h-[350px]">
      <Image
        src={bannerImage}
        alt={`${title} banner`}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      {/* Soft Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
    </div>
  );
}
