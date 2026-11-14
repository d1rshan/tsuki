"use client";

import { useEffect, useState } from "react";

/** URL fragment carries the separately stored poster without a schema migration. */
export function ProfileMedia({ src, alt }: { src: string; alt: string }) {
  const [moving, setMoving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const video = new URLSearchParams(src.split("#")[1]).get("video");
  const poster = src.split("#")[0]!;
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMoving(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return (
    <>
      {video && moving && !paused && !failed ? (
        <video
          key={src}
          src={video}
          poster={poster ?? undefined}
          aria-label={alt}
          autoPlay
          muted
          loop
          playsInline
          onError={() => setFailed(true)}
          onPlay={(e) => {
            e.currentTarget.muted = true;
          }}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <img
          src={video ? (poster ?? "") : src}
          alt={alt}
          className="absolute inset-0 size-full object-cover"
        />
      )}
      {video && (
        <button
          type="button"
          aria-label={paused || !moving ? "Play animation" : "Pause animation"}
          className="absolute right-1 bottom-1 z-20 rounded bg-black/70 px-2 py-1 text-xs text-white"
          onClick={() => {
            setPaused(moving ? !paused : false);
            setMoving(true);
          }}
        >
          {paused || !moving ? "Play" : "Pause"}
        </button>
      )}
    </>
  );
}
