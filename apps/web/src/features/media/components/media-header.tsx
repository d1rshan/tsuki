"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import type { MediaType } from "@tsuki/api/types";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

import { mediaImageClass } from "../media";

type MediaHeaderProps = {
  morphId?: string;
  averageScore: number | null;
  coverImage: string | null;
  format: string | null;
  seasonLabel: string | null;
  statusLabel: string | null;
  title: string;
  titleNative: string | null;
  type: MediaType;
};

export function MediaHeader({
  morphId,
  averageScore,
  coverImage,
  format,
  seasonLabel,
  statusLabel,
  title,
  titleNative,
  type,
}: MediaHeaderProps) {
  const reduceMotion = useReducedMotion();
  const sharedId = reduceMotion ? undefined : morphId;
  const badges = [
    averageScore && (
      <Badge key="score" variant="secondary">
        <Star className="fill-current" />
        {averageScore}%
      </Badge>
    ),
    format && (
      <Badge key="format" variant="secondary">
        {format}
      </Badge>
    ),
    statusLabel && (
      <Badge key="status" variant="outline" className="uppercase">
        {statusLabel}
      </Badge>
    ),
    seasonLabel && (
      <Badge key="season" variant="outline">
        {seasonLabel}
      </Badge>
    ),
  ].filter(Boolean);

  return (
    <div className="relative z-10 -mt-20 flex flex-col gap-6 border-b pb-8 md:-mt-32 md:flex-row md:items-end md:gap-8">
      <motion.div
        layoutId={sharedId ? `${sharedId}-poster` : undefined}
        style={{ borderRadius: 12 }}
        className="relative aspect-[3/4] w-40 shrink-0 overflow-hidden bg-muted ring-1 ring-border shadow-xl md:w-56"
      >
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 160px, 224px"
            className={cn("object-cover", mediaImageClass(type))}
            priority
          />
        )}
      </motion.div>

      <div className="flex flex-1 flex-col gap-2 pb-2 md:pb-4">
        <motion.h1
          layoutId={sharedId ? `${sharedId}-title` : undefined}
          layout="position"
          className="text-3xl font-bold tracking-tight md:text-5xl"
        >
          {title}
        </motion.h1>

        {titleNative && titleNative !== title && (
          <p className="font-medium text-muted-foreground">{titleNative}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">{badges}</div>
      </div>
    </div>
  );
}
