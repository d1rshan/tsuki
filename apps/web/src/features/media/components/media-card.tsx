"use client";

import { memo, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";

import type { Media, MediaCompact } from "@tsuki/api/types";

import { cn } from "@/shared/lib/utils";

import { mediaImageClass, normalizeMediaCompact } from "../media";
import { MEDIA_EASE_OUT, MEDIA_EASE_OUT_CSS, MEDIA_REVEAL_DURATION } from "../motion";
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

type MediaCardProps = {
  media: Media | MediaCompact;
  className?: string;
};

export const MediaCard = memo(function MediaCard(props: MediaCardProps) {
  return (
    // Share modal IDs without remeasuring every card when one card updates.
    <LayoutGroup inherit="id">
      <MediaCardContent {...props} />
    </LayoutGroup>
  );
});

function MediaCardContent({ media, className }: MediaCardProps) {
  const morphId = useId();
  const noHover = useSyncExternalStore(subscribeToHover, getNoHoverSnapshot, () => false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activated, setActivated] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const expanded = noHover ? revealed : hovered || focused;
  const reduceMotion = useReducedMotion();
  const { title, coverImage, type, count } = normalizeMediaCompact(media);

  useEffect(() => {
    if (!revealed) return;
    function dismiss(event: PointerEvent) {
      if (!cardRef.current?.contains(event.target as Node)) setRevealed(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [revealed]);

  return (
    <div
      ref={cardRef}
      className={cn("group relative min-w-0 rounded-xl", className)}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch" && !noHover) {
          setActivated(true);
          setHovered(true);
        }
      }}
      onPointerLeave={() => setHovered(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && revealed) setRevealed(false);
      }}
      onFocus={(event) => {
        if (event.target.hasAttribute("data-restoring-modal-focus")) {
          setHovered(event.currentTarget.matches(":hover"));
          setFocused(false);
          return;
        }
        if (!noHover) {
          setActivated(true);
          setFocused(true);
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <motion.div
        layoutId={reduceMotion ? undefined : `${morphId}-surface`}
        style={{ borderRadius: 12 }}
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
            style={{ borderRadius: 8 }}
            className="relative min-h-0 overflow-hidden isolate"
          >
            {coverImage ? (
              <Image
                src={coverImage}
                alt=""
                fill
                className={cn("object-cover", mediaImageClass(type))}
                sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 20vw"
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
            transition={{
              duration: reduceMotion ? 0 : MEDIA_REVEAL_DURATION,
              ease: MEDIA_EASE_OUT,
            }}
          >
            <div className="flex min-w-0 items-start">
              <motion.h3
                layoutId={reduceMotion ? undefined : `${morphId}-title`}
                layout="position"
                className="min-w-0 flex-1 px-1 pt-3 pb-1 text-sm leading-snug font-medium break-words text-foreground"
              >
                <span className={cn("block", !expanded && "line-clamp-1")}>{title}</span>
              </motion.h3>
              <button
                type="button"
                aria-label={`Quick actions for ${title}`}
                aria-expanded={expanded}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActivated(true);
                  setRevealed((value) => !value);
                }}
                className="relative z-20 mt-2 hidden h-7 w-5 shrink-0 items-center justify-center rounded-md text-muted-foreground before:absolute before:-inset-2 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [@media(hover:none)]:flex"
              >
                <Plus
                  className={cn(
                    "size-4 transition-transform duration-200 motion-reduce:transition-none",
                    expanded && "rotate-45",
                  )}
                />
              </button>
            </div>
            <div
              inert={!expanded}
              aria-hidden={!expanded}
              className="relative z-20 px-1 pt-2 pb-1"
              style={{
                opacity: expanded ? 1 : 0,
                transition: `opacity ${MEDIA_REVEAL_DURATION}s ${MEDIA_EASE_OUT_CSS}`,
              }}
            >
              {activated && <MediaCardActions mediaType={type} mediaId={media.id} total={count} />}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
