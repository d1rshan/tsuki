"use client";

import Image, { getImageProps } from "next/image";
import { useState } from "react";

/** The still URL remains usable by thumbnails and share cards. */
export function ProfileMedia({
  src,
  alt,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  sizes?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const video = new URLSearchParams(src.split("#")[1]).get("video");
  const poster = src.split("#")[0]!;
  return video && failedSource !== video ? (
    <video
      key={video}
      src={video}
      poster={getImageProps({ src: poster, alt, width: 320, height: 320 }).props.src}
      aria-label={alt}
      autoPlay
      muted
      loop
      playsInline
      onError={() => setFailedSource(video)}
      className="absolute inset-0 size-full object-cover"
    />
  ) : (
    <Image src={poster} alt={alt} fill sizes={sizes} className="object-cover" />
  );
}
