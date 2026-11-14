"use client";

import { useState } from "react";

/** The still URL remains usable by thumbnails and share cards. */
export function ProfileMedia({ src, alt }: { src: string; alt: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const video = new URLSearchParams(src.split("#")[1]).get("video");
  const poster = src.split("#")[0]!;
  return video && failedSource !== video ? (
    <video
      key={video}
      src={video}
      poster={poster}
      aria-label={alt}
      autoPlay
      muted
      loop
      playsInline
      onError={() => setFailedSource(video)}
      className="absolute inset-0 size-full object-cover"
    />
  ) : (
    <img src={poster} alt={alt} className="absolute inset-0 size-full object-cover" />
  );
}
