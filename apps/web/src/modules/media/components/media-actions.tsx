"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Heart, Loader2, Plus, Star } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@tsuki/auth/client";
import type { LibraryEntry, ListStatus, MediaType, Review } from "@tsuki/api/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

import { deleteReviewAction, logMediaAction, submitReviewAction } from "../actions";
import { MEDIA } from "../config";
import { mediaKeys } from "../query-keys";

type LogForm = {
  containsSpoilers: boolean;
  progress: string;
  reviewContent: string;
  score: number;
  status: ListStatus;
};

const SCORE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function clampProgress(value: number, total?: number | null) {
  const normalizedValue = Number.isNaN(value) ? 0 : Math.max(0, value);

  if (typeof total !== "number" || total <= 0) {
    return normalizedValue;
  }

  return Math.min(normalizedValue, total);
}

function createLogForm(
  mediaType: MediaType,
  entry: LibraryEntry | null,
  review: Review | null,
): LogForm {
  return {
    status: entry?.status || MEDIA[mediaType].defaultStatus,
    progress: entry?.progress ? entry.progress.toString() : "",
    score: entry?.score || 0,
    reviewContent: review?.content || "",
    containsSpoilers: review?.containsSpoilers || false,
  };
}

function hasMediaActivity(entry: LibraryEntry | null, review: Review | null) {
  return !!entry || !!review;
}

async function getMediaActivity(mediaType: MediaType, mediaId: number) {
  const { data } = await api.me.library({ type: mediaType })({ id: mediaId }).get();

  return {
    entry: data?.entry ?? null,
    review: data?.review ?? null,
  };
}

async function saveMediaActivity({
  mediaType,
  mediaId,
  form,
  isFavorite,
  total,
  hasReview,
}: {
  form: LogForm;
  hasReview: boolean;
  isFavorite: boolean;
  mediaId: number;
  mediaType: MediaType;
  total?: number | null;
}) {
  await logMediaAction(mediaType, mediaId, {
    status: form.status,
    score: form.score > 0 ? form.score : null,
    progress: clampProgress(Number.parseInt(form.progress, 10) || 0, total),
    isFavorite,
  });

  const reviewContent = form.reviewContent.trim();

  if (reviewContent) {
    await submitReviewAction(mediaType, mediaId, reviewContent, form.containsSpoilers);
    return;
  }

  if (hasReview) {
    await deleteReviewAction(mediaType, mediaId);
  }
}

export function MediaActions({
  mediaType,
  mediaId,
  total,
}: {
  mediaType: MediaType;
  mediaId: number;
  total?: number | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = mediaKeys.activity(mediaType, mediaId);
  const { data: session, isPending: isSessionPending } = useSession();
  const isAuthenticated = !!session?.user;

  const { data: activity, isLoading: isActivityLoading } = useQuery({
    queryKey,
    queryFn: () => getMediaActivity(mediaType, mediaId),
    enabled: isAuthenticated,
  });

  const entry = activity?.entry ?? null;
  const review = activity?.review ?? null;
  const isFavorite = entry?.isFavorite ?? false;
  const isLoading = isSessionPending || (isAuthenticated && isActivityLoading);

  const toggleFavoriteMutation = useMutation({
    mutationFn: (nextFavoriteState: boolean) =>
      logMediaAction(mediaType, mediaId, { isFavorite: nextFavoriteState }),
    onSuccess: (_, nextFavoriteState) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(nextFavoriteState ? "Added to favorites" : "Removed from favorites");
    },
    onError: () => {
      toast.error("Failed to update favorite");
    },
  });

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    toggleFavoriteMutation.mutate(!isFavorite);
  };

  return (
    <div className="flex gap-2">
      <LogMediaDialog
        mediaType={mediaType}
        mediaId={mediaId}
        entry={entry}
        review={review}
        disabled={isLoading}
        isFavorite={isFavorite}
        isAuthenticated={isAuthenticated}
        total={total}
      />
      <FavoriteButton
        isFavorite={isFavorite}
        disabled={isLoading || toggleFavoriteMutation.isPending}
        onClick={handleFavoriteToggle}
      />
    </div>
  );
}

function LogMediaDialog({
  mediaType,
  mediaId,
  entry,
  review,
  disabled,
  isFavorite,
  isAuthenticated,
  total,
}: {
  mediaType: MediaType;
  mediaId: number;
  entry: LibraryEntry | null;
  review: Review | null;
  disabled?: boolean;
  isFavorite: boolean;
  isAuthenticated: boolean;
  total?: number | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = mediaKeys.activity(mediaType, mediaId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => createLogForm(mediaType, entry, review));
  const config = MEDIA[mediaType];
  const hasLog = hasMediaActivity(entry, review);

  const updateForm = (updates: Partial<LogForm>) => {
    setForm((currentForm) => ({ ...currentForm, ...updates }));
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      saveMediaActivity({
        mediaType,
        mediaId,
        form,
        isFavorite,
        total,
        hasReview: !!review,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setOpen(false);
      toast.success(`Saved ${config.label.toLowerCase()} log`);
    },
    onError: () => {
      toast.error(`Failed to save ${config.label.toLowerCase()} log`);
    },
  });

  const handleOpenClick = (event: React.MouseEvent) => {
    if (!isAuthenticated) {
      event.preventDefault();
      router.push("/login");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setForm(createLogForm(mediaType, entry, review));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        onClick={handleOpenClick}
        render={
          <Button
            disabled={disabled}
            className="flex-1 rounded-xl bg-primary font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
          />
        }
      >
        {hasLog ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
        {hasLog ? "Edit Log" : "Log / Add to List"}
      </DialogTrigger>
      <DialogContent className="rounded-xl border-white/10 bg-background/80 backdrop-blur-xl sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Log {config.label}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <StatusSection
            statuses={config.statuses}
            value={form.status}
            onChange={(status) => updateForm({ status })}
          />
          <ProgressSection
            label={config.unitLong}
            value={form.progress}
            total={total}
            onChange={(progress) => updateForm({ progress })}
          />
          <RatingSection value={form.score} onChange={(score) => updateForm({ score })} />
          <ReviewSection
            mediaType={mediaType}
            content={form.reviewContent}
            containsSpoilers={form.containsSpoilers}
            onContentChange={(reviewContent) => updateForm({ reviewContent })}
            onSpoilersChange={(containsSpoilers) => updateForm({ containsSpoilers })}
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusSection({
  statuses,
  value,
  onChange,
}: {
  statuses: readonly { value: ListStatus; label: string }[];
  value: ListStatus;
  onChange: (value: ListStatus) => void;
}) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right text-muted-foreground">Status</Label>
      <Select
        value={value}
        onValueChange={(nextValue) => onChange(nextValue as ListStatus)}
        items={statuses}
      >
        <SelectTrigger className="col-span-3 bg-background/50">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ProgressSection({
  label,
  value,
  total,
  onChange,
}: {
  label: string;
  value: string;
  total?: number | null;
  onChange: (value: string) => void;
}) {
  const hasLimit = typeof total === "number" && total > 0;

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right text-muted-foreground">{label}</Label>
      <div className="col-span-3 flex flex-wrap items-center gap-2">
        <Input
          type="number"
          min={0}
          max={hasLimit ? total : undefined}
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;

            if (nextValue === "") {
              onChange("");
              return;
            }

            onChange(clampProgress(Number.parseInt(nextValue, 10) || 0, total).toString());
          }}
          className="w-24 bg-background/50"
        />
        {hasLimit && <span className="text-sm text-muted-foreground">/ {total}</span>}
      </div>
    </div>
  );
}

function RatingSection({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right text-muted-foreground">Rating</Label>
      <div className="col-span-3 flex gap-1">
        {SCORE_OPTIONS.map((score) => (
          <button
            type="button"
            key={score}
            onClick={() => onChange(score)}
            className="transition-transform hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Star
              className={cn(
                "h-5 w-5",
                value >= score
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
  mediaType,
  content,
  containsSpoilers,
  onContentChange,
  onSpoilersChange,
}: {
  mediaType: MediaType;
  content: string;
  containsSpoilers: boolean;
  onContentChange: (value: string) => void;
  onSpoilersChange: (value: boolean) => void;
}) {
  const spoilersId = useId();

  return (
    <div className="flex flex-col gap-3 border-t border-white/5 pt-2">
      <Label className="font-medium text-muted-foreground">Review (Optional)</Label>
      <Textarea
        placeholder={`What did you think about this ${MEDIA[mediaType].label.toLowerCase()}?`}
        className="h-24 resize-none bg-background/50 focus-visible:ring-primary/50"
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
      />
      {content.trim() !== "" && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={spoilersId}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={containsSpoilers}
            onChange={(event) => onSpoilersChange(event.target.checked)}
          />
          <Label
            htmlFor={spoilersId}
            className="cursor-pointer text-sm font-normal text-muted-foreground"
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
      className="shrink-0 rounded-xl border-white/10"
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all active:scale-75",
          isFavorite && "fill-red-500 text-red-500",
        )}
      />
    </Button>
  );
}
