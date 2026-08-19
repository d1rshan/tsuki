import Image from "next/image";
import { Star } from "lucide-react";

import type { MediaType } from "@tsuki/api/types";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

import { mediaImageClass } from "../media";

type MediaHeaderProps = {
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
  averageScore,
  coverImage,
  format,
  seasonLabel,
  statusLabel,
  title,
  titleNative,
  type,
}: MediaHeaderProps) {
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
      <Badge key="status" variant="outline">
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
      <div className="relative aspect-[3/4] w-40 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border shadow-xl md:w-56">
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
      </div>

      <div className="flex flex-1 flex-col gap-2 pb-2 md:pb-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h1>

        {titleNative && titleNative !== title && (
          <p className="font-medium text-muted-foreground">{titleNative}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">{badges}</div>
      </div>
    </div>
  );
}
