"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Heart, Check, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@tsuki/auth/client";
import type { LibraryEntry, ListStatus, MediaType, Review } from "@tsuki/api/types";

import { api } from "@/lib/api";
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
import { logMediaAction, submitReviewAction } from "../actions";
import { MEDIA } from "../config";
import { mediaKeys } from "../query-keys";

function clampProgress(value: number, total?: number | null) {
  const normalizedValue = Number.isNaN(value) ? 0 : Math.max(0, value);

  if (typeof total !== "number" || total <= 0) {
    return normalizedValue;
  }

  return Math.min(normalizedValue, total);
}

export function MediaActions({
  mediaType,
  mediaId,
  total,
}: {
  mediaType: MediaType;
  mediaId: number;
  /** Total episodes/chapters, used to cap progress. */
  total?: number | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } = useSession();
  const isAuthenticated = !!session?.user;

  const queryKey = mediaKeys.activity(mediaType, mediaId);

  const { data: userActivity, isLoading: isActivityLoading } = useQuery({
    queryKey,
    queryFn: () => api.me.library({ type: mediaType })({ id: mediaId }).get(),
    enabled: isAuthenticated,
  });

  const entry = userActivity?.data?.entry ?? null;
  const review = userActivity?.data?.review ?? null;

  const [open, setOpen] = useState(false);

  const toggleMutation = useMutation({
    mutationFn: (isFavorite: boolean) => logMediaAction(mediaType, mediaId, { isFavorite }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey });
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
      <LogMediaDialog
        mediaType={mediaType}
        mediaId={mediaId}
        entry={entry}
        review={review}
        open={open}
        setOpen={setOpen}
        disabled={isLoading}
        isFavorite={entry?.isFavorite ?? false}
        isAuthenticated={isAuthenticated}
        total={total}
      />
      <FavoriteButton
        isFavorite={entry?.isFavorite ?? false}
        disabled={isLoading || toggleMutation.isPending}
        onClick={handleToggle}
      />
    </div>
  );
}

function LogMediaDialog({
  mediaType,
  mediaId,
  entry,
  review,
  open,
  setOpen,
  disabled,
  isFavorite,
  isAuthenticated,
  total,
}: {
  mediaType: MediaType;
  mediaId: number;
  entry: LibraryEntry | null;
  review: Review | null;
  open: boolean;
  setOpen: (val: boolean) => void;
  disabled?: boolean;
  isFavorite: boolean;
  isAuthenticated: boolean;
  total?: number | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const config = MEDIA[mediaType];

  const initialForm = () => ({
    status: entry?.status || config.defaultStatus,
    progress: entry?.progress ? entry.progress.toString() : "",
    score: entry?.score || 0,
    reviewContent: review?.content || "",
    containsSpoilers: review?.containsSpoilers || false,
  });

  const [form, setForm] = useState(initialForm);

  const updateForm = (updates: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...updates }));

  const hasLog = !!(
    entry?.status ||
    (entry?.score && entry.score > 0) ||
    (entry?.progress && entry.progress > 0) ||
    review
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      await logMediaAction(mediaType, mediaId, {
        status: form.status,
        score: form.score > 0 ? form.score : null,
        progress: clampProgress(parseInt(form.progress, 10) || 0, total),
        isFavorite,
      });

      if (form.reviewContent.trim()) {
        await submitReviewAction(mediaType, mediaId, form.reviewContent, form.containsSpoilers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.activity(mediaType, mediaId) });
      setOpen(false);
      toast.success(`Successfully logged ${mediaType}!`);
    },
    onError: () => {
      toast.error(`Failed to log ${mediaType}`);
    },
  });

  const handleOpenClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/login");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) setForm(initialForm());
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <DialogTitle className="text-xl">Log {config.label}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <StatusSection
            statuses={config.statuses}
            value={form.status}
            onChange={(val) => updateForm({ status: val })}
          />
          <ProgressSection
            label={config.unitLong}
            value={form.progress}
            total={total}
            onChange={(val) => updateForm({ progress: val })}
          />
          <RatingSection value={form.score} onChange={(val) => updateForm({ score: val })} />

          <ReviewSection
            mediaType={mediaType}
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
  statuses,
  value,
  onChange,
}: {
  statuses: readonly { value: ListStatus; label: string }[];
  value: ListStatus;
  onChange: (val: ListStatus) => void;
}) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right text-muted-foreground">Status</Label>
      <Select value={value} onValueChange={(val) => onChange(val as ListStatus)} items={statuses}>
        <SelectTrigger className="col-span-3 bg-background/50">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
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
  onChange: (val: string) => void;
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
          onChange={(e) => {
            const nextValue = e.target.value;

            if (nextValue === "") {
              onChange("");
              return;
            }

            onChange(clampProgress(parseInt(nextValue, 10) || 0, total).toString());
          }}
          className="w-24 bg-background/50"
        />
        {hasLimit && <span className="text-sm text-muted-foreground">/ {total}</span>}
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
  mediaType,
  content,
  containsSpoilers,
  onContentChange,
  onSpoilersChange,
}: {
  mediaType: MediaType;
  content: string;
  containsSpoilers: boolean;
  onContentChange: (val: string) => void;
  onSpoilersChange: (val: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
      <Label className="text-muted-foreground font-medium">Review (Optional)</Label>
      <Textarea
        placeholder={`What did you think about this ${mediaType}?`}
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
