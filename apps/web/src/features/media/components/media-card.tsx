"use client";

import { useId, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import type { Media, MediaCompact } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

import { mediaImageClass, normalizeMediaCompact } from "../media";
import { MediaCardActions } from "./media-card-actions";
import { MediaLink } from "./media-link";

const NO_HOVER_QUERY = "(hover: none)";

function subscribeToHover(callback: () => void) {
  const query = window.matchMedia(NO_HOVER_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getNoHoverSnapshot() {
  return window.matchMedia(NO_HOVER_QUERY).matches;
}

export function MediaCard({
  media,
  className,
}: {
  media: Media | MediaCompact;
  className?: string;
}) {
  const morphId = useId();
  const noHover = useSyncExternalStore(subscribeToHover, getNoHoverSnapshot, () => false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activated, setActivated] = useState(false);
  const expanded = hovered || focused;
  const reduceMotion = useReducedMotion();
  const { title, coverImage, type, count } = normalizeMediaCompact(media);

  return (
    <div
      className={cn("group relative min-w-0 rounded-xl", className)}
      onPointerEnter={(event) => {
        setActivated(true);
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={() => setActivated(true)}
      onFocus={() => {
        setActivated(true);
        setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <motion.div
        layoutId={reduceMotion ? undefined : `${morphId}-surface`}
        style={{
          borderRadius: 12,
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
        className="relative overflow-hidden bg-muted p-2 isolate"
      >
        <MediaLink
          media={media}
          morphId={morphId}
          id={`media-trigger-${morphId}`}
          aria-label={title}
          className="absolute inset-0 z-10 rounded-xl outline-none"
        />
        <div className="aspect-[3/4]" aria-hidden="true" />
        <div className="h-9" aria-hidden="true" />
        <div className="absolute inset-2 grid grid-rows-[minmax(0,1fr)_auto]">
          <motion.div
            layoutId={reduceMotion ? undefined : `${morphId}-poster`}
            style={{
              borderRadius: 8,
              willChange: "transform",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
            className="relative min-h-0 overflow-hidden isolate"
          >
            {coverImage ? (
              <Image
                src={coverImage}
                alt=""
                fill
                className={cn("object-cover", mediaImageClass(type))}
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                No Image
              </div>
            )}
          </motion.div>
          <motion.div
            className="min-h-9 overflow-hidden [@media(hover:none)]:h-auto!"
            initial={false}
            animate={{ height: expanded ? "auto" : 36 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h3
              layoutId={reduceMotion ? undefined : `${morphId}-title`}
              layout="position"
              style={{
                willChange: "transform",
                transform: "translateZ(0)",
              }}
              className={cn(
                "px-1 pt-3 pb-1 text-sm leading-snug font-semibold transition-colors [@media(hover:none)]:line-clamp-none",
                expanded ? "text-current" : "line-clamp-1 text-muted-foreground",
              )}
            >
              {title}
            </motion.h3>
            <div
              className={cn(
                "relative z-20 px-1 pt-2 pb-1 transition-opacity duration-200 motion-reduce:transition-none [@media(hover:none)]:visible [@media(hover:none)]:opacity-100",
                expanded ? "visible opacity-100" : "invisible opacity-0",
              )}
            >
              {(activated || noHover) && (
                <MediaCardActions mediaType={type} mediaId={media.id} total={count} />
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
