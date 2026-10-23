"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import type { Media, MediaCompact } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

import { mediaImageClass, normalizeMediaCompact } from "../media";
import { MediaLink } from "./media-link";

export function MediaCard({
  media,
  className,
}: {
  media: Media | MediaCompact;
  className?: string;
}) {
  const morphId = useId();
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const normalizedMedia = normalizeMediaCompact(media);
  const { title, coverImage, type } = normalizedMedia;

  return (
    <MediaLink
      media={media}
      morphId={morphId}
      id={`media-trigger-${morphId}`}
      className={cn(
        "group block min-w-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className,
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
    >
      <motion.div
        layoutId={reduceMotion ? undefined : `${morphId}-surface`}
        style={{ borderRadius: 12 }}
        className="relative overflow-hidden bg-muted p-2"
      >
        <div className="aspect-[3/4]" aria-hidden="true" />
        <div className="h-9" aria-hidden="true" />
        <div className="absolute inset-2 grid grid-rows-[minmax(0,1fr)_auto]">
          <motion.div
            layoutId={reduceMotion ? undefined : `${morphId}-poster`}
            style={{ borderRadius: 8 }}
            className="relative min-h-0 overflow-hidden"
          >
            {coverImage ? (
              <Image
                src={coverImage}
                alt={title}
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
            className="min-h-9 overflow-hidden"
            initial={false}
            animate={{ height: expanded ? "auto" : 36 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h3
              layoutId={reduceMotion ? undefined : `${morphId}-title`}
              layout="position"
              className={cn(
                "px-1 pt-3 pb-1 text-sm leading-snug font-semibold transition-colors",
                expanded ? "text-current" : "line-clamp-1 text-muted-foreground",
              )}
            >
              {title}
            </motion.h3>
          </motion.div>
        </div>
      </motion.div>
    </MediaLink>
  );
}
