"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import type { LibraryEntry } from "@tsuki/api/types";
import { useSession } from "@tsuki/auth/client";

import { logMediaAction } from "@/features/media/actions";
import { MediaLink } from "@/features/media/components/media-link";
import { useMediaType } from "@/features/media/hooks/use-media-type";
import { MEDIA, mediaImageClass, normalizeMediaCompact } from "@/features/media/media";
import { mediaKeys } from "@/features/media/query-keys";
import { Button } from "@/shared/components/ui/button";
import { apiClient } from "@/shared/lib/api-client";
import { cn } from "@/shared/lib/utils";

import { DiscoverSection } from "./discover-section";

export function DiscoverCurrentMedia() {
  const [mediaType] = useMediaType();
  const { data: session } = useSession();
  const username = session?.user?.username;
  const queryClient = useQueryClient();
  const queryKey = ["discover", "current", username] as const;
  const unit = mediaType === "ANIME" ? "episode" : "chapter";
  const reduceMotion = useReducedMotion();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const hasDraft = Object.keys(drafts).length > 0;

  useEffect(() => {
    if (!hasDraft) return;

    function dismissOtherCards(event: PointerEvent) {
      const key =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-current-media-key]")?.dataset.currentMediaKey
          : undefined;
      setDrafts((current) =>
        Object.fromEntries(Object.entries(current).filter(([draftKey]) => draftKey === key)),
      );
    }

    document.addEventListener("pointerdown", dismissOtherCards);
    return () => document.removeEventListener("pointerdown", dismissOtherCards);
  }, [hasDraft]);
  const { data: library } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await apiClient
        .users({ username: username! })
        .library.get({ query: {} });
      if (error) throw error;
      return data;
    },
    enabled: Boolean(username),
  });
  const update = useMutation({
    mutationFn: ({ entry, progress }: { entry: LibraryEntry; progress: number }) =>
      logMediaAction(entry.mediaType, entry.mediaId, { progress }),
    onSuccess: async (_, { entry, progress }) => {
      const key = `${entry.mediaType}-${entry.mediaId}`;
      setDrafts((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      queryClient.setQueryData<LibraryEntry[]>(queryKey, (current) =>
        current?.map((item) => (item.mediaId === entry.mediaId ? { ...item, progress } : item)),
      );
      await queryClient.invalidateQueries({
        queryKey: mediaKeys.activity(entry.mediaType, entry.mediaId),
      });
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error("Could not update progress. Please try again."),
  });
  const entries = library?.filter(
    (entry) => entry.status === "CURRENT" && entry.mediaType === mediaType && entry.media,
  );

  if (!entries?.length) return null;

  return (
    <DiscoverSection title={mediaType === "ANIME" ? "Watching" : "Reading"}>
      <div className="grid grid-flow-col auto-cols-[calc((100%-1rem)/2)] snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] sm:auto-cols-[calc((100%-2rem)/3)] lg:auto-cols-[calc((100%-4rem)/5)] [&::-webkit-scrollbar]:hidden">
        {entries.map((entry) => {
          const media = normalizeMediaCompact(entry.media!);
          const key = `${entry.mediaType}-${entry.mediaId}`;
          const draft = drafts[key];
          const progress = draft ?? entry.progress;
          const atEnd = media.count != null && media.count > 0 && progress >= media.count;
          const expanded = expandedKey === key;

          return (
            <div
              key={key}
              data-current-media-key={key}
              className="group min-w-0 snap-start rounded-xl"
              onMouseEnter={() => setExpandedKey(key)}
              onMouseLeave={() => setExpandedKey(null)}
              onFocus={() => setExpandedKey(key)}
              onBlur={(event) => {
                if (
                  !(
                    event.relatedTarget instanceof Node &&
                    event.currentTarget.contains(event.relatedTarget)
                  )
                ) {
                  setExpandedKey(null);
                }
              }}
            >
              <div className="relative overflow-hidden rounded-xl bg-muted p-2">
                <div className="aspect-[3/4]" aria-hidden="true" />
                <div className="h-9" aria-hidden="true" />
                <div className="absolute inset-2 grid grid-rows-[minmax(0,1fr)_auto]">
                  <div className="relative min-h-0 overflow-hidden rounded-lg">
                    {media.coverImage ? (
                      <Image
                        src={media.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                        className={cn("object-cover", mediaImageClass(mediaType))}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                    {media.count != null && media.count > 0 ? (
                      <div
                        className="pointer-events-none absolute inset-y-0 left-0 bg-muted/60 transition-[width] motion-reduce:transition-none"
                        style={{ width: `${Math.min((progress / media.count) * 100, 100)}%` }}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span
                      className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-background px-2 py-1 text-xs font-semibold text-foreground"
                      aria-live="polite"
                    >
                      {MEDIA[mediaType].unitAbbrev.toLowerCase()}. {progress}
                      {media.count ? ` / ${media.count}` : ""}
                    </span>
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                      {draft != null && (
                        <Button
                          size="icon-sm"
                          variant="secondary"
                          className="rounded-full disabled:opacity-100"
                          aria-label={`Remove one ${unit} from ${media.title}`}
                          disabled={draft === 0 || update.isPending}
                          onClick={() =>
                            setDrafts((current) => ({
                              ...current,
                              [key]: (current[key] ?? entry.progress) - 1,
                            }))
                          }
                        >
                          <Minus />
                        </Button>
                      )}
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        className="rounded-full disabled:opacity-100"
                        aria-label={`Add one ${unit} to ${media.title}`}
                        disabled={atEnd || update.isPending}
                        onClick={() =>
                          setDrafts((current) => ({
                            ...current,
                            [key]: (current[key] ?? entry.progress) + 1,
                          }))
                        }
                      >
                        <Plus />
                      </Button>
                      {draft != null && (
                        <Button
                          size="icon-sm"
                          className="rounded-full disabled:opacity-100"
                          aria-label={`Save progress for ${media.title}`}
                          disabled={update.isPending}
                          onClick={() => {
                            if (draft === entry.progress) {
                              setDrafts((current) => {
                                const next = { ...current };
                                delete next[key];
                                return next;
                              });
                            } else {
                              update.mutate({ entry, progress: draft });
                            }
                          }}
                        >
                          <Check />
                        </Button>
                      )}
                    </div>
                  </div>
                  <motion.div
                    className="min-h-9 overflow-hidden"
                    initial={false}
                    animate={{ height: expanded ? "auto" : 36 }}
                    transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h3
                      className={cn(
                        "px-1 pb-1 pt-3 text-sm font-semibold leading-snug transition-colors",
                        expanded ? "text-current" : "line-clamp-1 text-muted-foreground",
                      )}
                    >
                      <MediaLink
                        media={entry.media ?? { type: mediaType, id: entry.mediaId }}
                        className="focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        {media.title}
                      </MediaLink>
                    </h3>
                  </motion.div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DiscoverSection>
  );
}
