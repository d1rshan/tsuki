"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import type { MediaCompact } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

import { mediaHref, mediaImageClass, normalizeMediaCompact } from "../media";

export function MediaCard({ media, className }: { media: MediaCompact; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const normalizedMedia = normalizeMediaCompact(media);
  const { title, coverImage, type } = normalizedMedia;

  return (
    <Link
      href={mediaHref(type, normalizedMedia.id)}
      className={cn(
        "group block min-w-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className,
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
    >
      <div className="relative overflow-hidden rounded-xl bg-muted p-2">
        <div className="aspect-[3/4]" aria-hidden="true" />
        <div className="h-9" aria-hidden="true" />
        <div className="absolute inset-2 grid grid-rows-[minmax(0,1fr)_auto]">
          <div className="relative min-h-0 overflow-hidden rounded-lg">
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
          </div>
          <motion.div
            className="min-h-9 overflow-hidden"
            initial={false}
            animate={{ height: expanded ? "auto" : 36 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3
              className={cn(
                "px-1 pt-3 pb-1 text-sm leading-snug font-semibold transition-colors",
                expanded ? "text-current" : "line-clamp-1 text-muted-foreground",
              )}
            >
              {title}
            </h3>
          </motion.div>
        </div>
      </div>
    </Link>
  );
}
