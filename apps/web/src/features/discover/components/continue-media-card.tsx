"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { logMediaAction } from "@/features/media/actions";
import { mediaKeys } from "@/features/media/query-keys";
import {
  MEDIA,
  getMediaCoverImage,
  getMediaTitle,
  mediaHref,
  mediaImageClass,
  unitCount,
} from "@/features/media/media";
import { cn } from "@/shared/lib/utils";

import { createContinueLogInput, type ContinueEntry } from "../continue-media";

export function ContinueMediaCard({ entry }: { entry: ContinueEntry }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const media = entry.media;

  const config = MEDIA[entry.mediaType];
  const title = getMediaTitle(media);
  const cover = getMediaCoverImage(media);
  const total = unitCount(media);
  const nextProgress = entry.progress + 1;
  const progressLabel = total
    ? `${entry.progress} of ${total} ${config.unitLong.toLowerCase()}`
    : `${entry.progress} ${config.unitLong.toLowerCase()}`;

  const progressMutation = useMutation({
    mutationFn: () =>
      logMediaAction(entry.mediaType, entry.mediaId, createContinueLogInput(entry.progress, total)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: mediaKeys.activity(entry.mediaType, entry.mediaId),
      });
      router.refresh();
      toast.success(`${config.unitLong.slice(0, -1)} ${nextProgress} logged`);
    },
    onError: () => toast.error(`Failed to log ${config.unitLong.toLowerCase().slice(0, -1)}`),
  });

  return (
    <article className="group flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border bg-card/60 p-2 shadow-sm transition-colors hover:bg-card">
      <Link
        href={mediaHref(entry.mediaType, entry.mediaId)}
        className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-muted outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="56px"
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-105",
              mediaImageClass(entry.mediaType),
            )}
          />
        ) : (
          <span className="flex h-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">
            No image
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={mediaHref(entry.mediaType, entry.mediaId)}
          className="line-clamp-1 font-semibold tracking-tight outline-none hover:text-primary focus-visible:text-primary"
        >
          {title}
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">{progressLabel}</p>
        {total ? (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, (entry.progress / total) * 100)}%` }}
            />
          </div>
        ) : null}
      </div>

      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={progressMutation.isPending}
        onClick={() => progressMutation.mutate()}
        aria-label={`Log ${config.unitLong.toLowerCase().slice(0, -1)} ${nextProgress} for ${title}`}
        className="shrink-0"
      >
        {progressMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Plus />}
        <span className="hidden sm:inline">1 {config.unitAbbrev}</span>
      </Button>
    </article>
  );
}
