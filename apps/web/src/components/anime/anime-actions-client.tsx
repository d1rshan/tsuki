"use client";

import { useState, useTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { Star, Heart, Check, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logAnimeAction, submitReviewAction } from "@/app/actions/activity";
import { cn } from "@/lib/utils";
import type { WatchStatus } from "@tsuki/api/src/modules/activity/model";
import type { LibraryEntry, Review } from "@/lib/types";

interface Props {
  animeId: number;
  entry: LibraryEntry | null;
  review: Review | null;
  isAuthenticated: boolean;
}

export function AnimeActionsClient({ animeId, entry, review, isAuthenticated }: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(
    entry?.isFavorite || false,
    (_, newFavorite: boolean) => newFavorite,
  );

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      return router.push("/login");
    }

    startTransition(async () => {
      const nextFavorite = !optimisticFavorite;
      setOptimisticFavorite(nextFavorite);
      try {
        await logAnimeAction(animeId, { isFavorite: nextFavorite });
        toast.success(nextFavorite ? "Added to favorites" : "Removed from favorites");
      } catch {
        toast.error("Failed to update favorite");
      }
    });
  };

  return (
    <div className="flex gap-2">
      <LogAnimeDialog
        animeId={animeId}
        entry={entry}
        review={review}
        open={open}
        setOpen={setOpen}
        isFavorite={optimisticFavorite}
        isAuthenticated={isAuthenticated}
      />

      <Button
        variant={optimisticFavorite ? "secondary" : "outline"}
        size="icon"
        onClick={toggleFavorite}
        className="rounded-xl shrink-0 border-white/10"
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-all active:scale-75",
            optimisticFavorite && "fill-red-500 text-red-500",
          )}
        />
      </Button>
    </div>
  );
}

function LogAnimeDialog({
  animeId,
  entry,
  review,
  open,
  setOpen,
  isFavorite,
  isAuthenticated,
}: Props & {
  open: boolean;
  setOpen: (val: boolean) => void;
  isFavorite: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    status: (entry?.status as WatchStatus) || "PLAN_TO_WATCH",
    episodes: entry?.episodesWatched || 0,
    rating: entry?.rating || 0,
    reviewContent: review?.content || "",
    containsSpoilers: review?.containsSpoilers || false,
  });

  const updateForm = (updates: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const handleSave = () => {
    startTransition(async () => {
      try {
        await logAnimeAction(animeId, {
          status: form.status,
          rating: form.rating > 0 ? form.rating : undefined,
          episodesWatched: form.episodes,
          isFavorite,
        });

        if (form.reviewContent.trim()) {
          await submitReviewAction(animeId, form.reviewContent, form.containsSpoilers);
        }

        setOpen(false);
        toast.success("Successfully logged anime!");
      } catch {
        toast.error("Failed to log anime");
      }
    });
  };

  const hasLog = !!(
    entry?.status ||
    (entry?.rating && entry.rating > 0) ||
    (entry?.episodesWatched && entry.episodesWatched > 0) ||
    review
  );

  const handleOpenClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/login");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        onClick={handleOpenClick}
        render={
          <Button className="flex-1 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all active:scale-[0.98]">
            {hasLog ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {hasLog ? "Edit Log" : "Log / Add to List"}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] rounded-xl border-white/10 bg-background/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Log Anime</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">Status</Label>
            <Select
              value={form.status}
              onValueChange={(val) => updateForm({ status: val as WatchStatus })}
              items={[
                { value: "WATCHING", label: "Watching" },
                { value: "COMPLETED", label: "Completed" },
                { value: "PLAN_TO_WATCH", label: "Plan to Watch" },
                { value: "PAUSED", label: "Paused" },
                { value: "DROPPED", label: "Dropped" },
              ]}
            >
              <SelectTrigger className="col-span-3 bg-background/50">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WATCHING">Watching</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PLAN_TO_WATCH">Plan to Watch</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="DROPPED">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">Episodes</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={form.episodes}
                onChange={(e) => updateForm({ episodes: parseInt(e.target.value) || 0 })}
                className="w-24 bg-background/50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateForm({ episodes: form.episodes + 1 })}
              >
                +
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">Rating</Label>
            <div className="col-span-3 flex gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                <button
                  key={star}
                  onClick={() => updateForm({ rating: star })}
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={cn(
                      "w-5 h-5",
                      form.rating >= star
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground hover:text-yellow-500/50",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
            <Label className="text-muted-foreground font-medium">Review (Optional)</Label>
            <Textarea
              placeholder="What did you think about this anime?"
              className="resize-none h-24 bg-background/50 focus-visible:ring-primary/50"
              value={form.reviewContent}
              onChange={(e) => updateForm({ reviewContent: e.target.value })}
            />
            {form.reviewContent.trim() !== "" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="spoilers"
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={form.containsSpoilers}
                  onChange={(e) => updateForm({ containsSpoilers: e.target.checked })}
                />
                <Label
                  htmlFor="spoilers"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  This review contains spoilers
                </Label>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
