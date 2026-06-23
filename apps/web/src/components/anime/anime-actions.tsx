"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Heart, Check, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import type { LibraryEntry, Review } from "@/lib/types";
import { cn } from "@/lib/utils";
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
import type { WatchStatus } from "@tsuki/api/src/modules/activity/model";

const WATCH_STATUSES: { value: WatchStatus; label: string }[] = [
  { value: "WATCHING", label: "Watching" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PLAN_TO_WATCH", label: "Plan to Watch" },
  { value: "PAUSED", label: "Paused" },
  { value: "DROPPED", label: "Dropped" },
];

export function AnimeActions({ animeId }: { animeId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } = useSession();
  const isAuthenticated = !!session?.user;

  const { data: userActivity, isLoading: isActivityLoading } = useQuery({
    queryKey: ["anime-activity", animeId],
    queryFn: () => api.users.me.activity({ animeId }).get(),
    enabled: isAuthenticated,
  });

  const entry = userActivity?.data?.entry ?? null;
  const review = userActivity?.data?.review ?? null;

  const [open, setOpen] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: (isFavorite: boolean) => logAnimeAction(animeId, { isFavorite }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["anime-activity", animeId] });
      toast.success(variables ? "Added to favorites" : "Removed from favorites");
    },
    onError: () => {
      toast.error("Failed to update favorite");
    },
  });

  const handleToggle = () => {
    if (!isAuthenticated) return router.push("/login");
    toggleMutation.mutate(!(entry?.isFavorite ?? false));
  };

  const isLoading = isSessionPending || (isAuthenticated && isActivityLoading);

  return (
    <div className="flex gap-2">
      <LogAnimeDialog
        animeId={animeId}
        entry={entry}
        review={review}
        open={open}
        setOpen={setOpen}
        disabled={isLoading}
        isFavorite={entry?.isFavorite ?? false}
        isAuthenticated={isAuthenticated}
      />
      <FavoriteButton
        isFavorite={entry?.isFavorite ?? false}
        disabled={isLoading || toggleMutation.isPending}
        onClick={handleToggle}
      />
    </div>
  );
}

function LogAnimeDialog({
  animeId,
  entry,
  review,
  open,
  setOpen,
  disabled,
  isFavorite,
  isAuthenticated,
}: {
  animeId: number;
  entry: LibraryEntry | null;
  review: Review | null;
  open: boolean;
  setOpen: (val: boolean) => void;
  disabled?: boolean;
  isFavorite: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    status: (entry?.status as WatchStatus) || "PLAN_TO_WATCH",
    episodes: entry?.episodesWatched || 0,
    rating: entry?.rating || 0,
    reviewContent: review?.content || "",
    containsSpoilers: review?.containsSpoilers || false,
  });

  const updateForm = (updates: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const hasLog = !!(
    entry?.status ||
    (entry?.rating && entry.rating > 0) ||
    (entry?.episodesWatched && entry.episodesWatched > 0) ||
    review
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      await logAnimeAction(animeId, {
        status: form.status,
        rating: form.rating > 0 ? form.rating : undefined,
        episodesWatched: form.episodes,
        isFavorite,
      });

      if (form.reviewContent.trim()) {
        await submitReviewAction(animeId, form.reviewContent, form.containsSpoilers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anime-activity", animeId] });
      setOpen(false);
      toast.success("Successfully logged anime!");
    },
    onError: () => {
      toast.error("Failed to log anime");
    },
  });

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
          <Button
            disabled={disabled}
            className="flex-1 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all active:scale-[0.98]"
          />
        }
      >
        {hasLog ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
        {hasLog ? "Edit Log" : "Log / Add to List"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-xl border-white/10 bg-background/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Log Anime</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <StatusSection value={form.status} onChange={(val) => updateForm({ status: val })} />
          <EpisodesSection
            value={form.episodes}
            onChange={(val) => updateForm({ episodes: val })}
          />
          <RatingSection value={form.rating} onChange={(val) => updateForm({ rating: val })} />

          <ReviewSection
            content={form.reviewContent}
            containsSpoilers={form.containsSpoilers}
            onContentChange={(val) => updateForm({ reviewContent: val })}
            onSpoilersChange={(val) => updateForm({ containsSpoilers: val })}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusSection({
  value,
  onChange,
}: {
  value: WatchStatus;
  onChange: (val: WatchStatus) => void;
}) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right text-muted-foreground">Status</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as WatchStatus)}
        items={WATCH_STATUSES}
      >
        <SelectTrigger className="col-span-3 bg-background/50">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {WATCH_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function EpisodesSection({ value, onChange }: { value: number; onChange: (val: number) => void }) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right text-muted-foreground">Episodes</Label>
      <div className="col-span-3 flex items-center gap-2">
        <Input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-24 bg-background/50"
        />
        <Button variant="outline" size="sm" onClick={() => onChange(value + 1)}>
          +
        </Button>
      </div>
    </div>
  );
}

function RatingSection({ value, onChange }: { value: number; onChange: (val: number) => void }) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right text-muted-foreground">Rating</Label>
      <div className="col-span-3 flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Star
              className={cn(
                "w-5 h-5",
                value >= star
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-muted-foreground hover:text-yellow-500/50",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewSection({
  content,
  containsSpoilers,
  onContentChange,
  onSpoilersChange,
}: {
  content: string;
  containsSpoilers: boolean;
  onContentChange: (val: string) => void;
  onSpoilersChange: (val: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
      <Label className="text-muted-foreground font-medium">Review (Optional)</Label>
      <Textarea
        placeholder="What did you think about this anime?"
        className="resize-none h-24 bg-background/50 focus-visible:ring-primary/50"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
      />
      {content.trim() !== "" && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="spoilers"
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={containsSpoilers}
            onChange={(e) => onSpoilersChange(e.target.checked)}
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
  );
}

function FavoriteButton({
  isFavorite,
  disabled,
  onClick,
}: {
  isFavorite: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={isFavorite ? "secondary" : "outline"}
      size="icon"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl shrink-0 border-white/10"
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-all active:scale-75",
          isFavorite && "fill-red-500 text-red-500",
        )}
      />
    </Button>
  );
}
