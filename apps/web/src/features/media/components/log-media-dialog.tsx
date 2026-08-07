"use client";

import { useId, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, LoaderCircle, Plus, Star } from "lucide-react";
import { toast } from "sonner";

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
import { cn } from "@/lib/utils";

import {
  SCORE_OPTIONS,
  clampProgress,
  createActivityForm,
  createLogMediaInput,
  saveMediaActivity,
  type ActivityForm,
} from "../activity";
import { deleteReviewAction, logMediaAction, submitReviewAction } from "../actions";
import { MEDIA } from "../media";
import { mediaKeys } from "../query-keys";

type LogMediaDialogProps = {
  disabled: boolean;
  entry: LibraryEntry | null;
  isAuthenticated: boolean;
  isFavorite: boolean;
  mediaId: number;
  mediaType: MediaType;
  review: Review | null;
  total?: number | null;
};

export function LogMediaDialog({
  disabled,
  entry,
  isAuthenticated,
  isFavorite,
  mediaId,
  mediaType,
  review,
  total,
}: LogMediaDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(() => createActivityForm(mediaType, entry, review));
  const config = MEDIA[mediaType];
  const hasActivity = Boolean(entry || review);

  useLayoutEffect(() => () => setIsOpen(false), []);

  const saveMutation = useMutation({
    mutationFn: () =>
      saveMediaActivity(
        () => logMediaAction(mediaType, mediaId, createLogMediaInput(form, isFavorite, total)),
        async () => {
          const reviewContent = form.reviewContent.trim();
          if (reviewContent) {
            await submitReviewAction(mediaType, mediaId, reviewContent, form.containsSpoilers);
          } else if (review) {
            await deleteReviewAction(mediaType, mediaId);
          }
        },
      ),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.activity(mediaType, mediaId) });

      if (result === "review-failed") {
        toast.error("Log saved, but the review failed. Try saving again.");
        return;
      }

      setIsOpen(false);
      toast.success(`${config.label} log saved`);
    },
    onError: () => toast.error(`Failed to save ${config.label.toLowerCase()} log`),
  });

  function updateForm(updates: Partial<ActivityForm>) {
    setForm((current) => ({ ...current, ...updates }));
  }

  function handleOpenChange(nextIsOpen: boolean) {
    if (nextIsOpen && !isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsOpen(nextIsOpen);
    if (nextIsOpen) setForm(createActivityForm(mediaType, entry, review));
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button disabled={disabled} className="flex-1" />}
        aria-label={hasActivity ? `Edit ${config.label.toLowerCase()} log` : undefined}
      >
        {hasActivity ? <Check /> : <Plus />}
        {hasActivity ? "Edit log" : "Add to list"}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log {config.label}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <StatusField
            statuses={config.statuses}
            value={form.status}
            onChange={(status) => updateForm({ status })}
          />
          <ProgressField
            label={config.unitLong}
            value={form.progress}
            total={total}
            onChange={(progress) => updateForm({ progress })}
          />
          <RatingField value={form.score} onChange={(score) => updateForm({ score })} />
          <ReviewField
            mediaType={mediaType}
            content={form.reviewContent}
            containsSpoilers={form.containsSpoilers}
            onContentChange={(reviewContent) => updateForm({ reviewContent })}
            onSpoilersChange={(containsSpoilers) => updateForm({ containsSpoilers })}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <LoaderCircle className="animate-spin" /> : null}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatusField({
  statuses,
  value,
  onChange,
}: {
  statuses: readonly { label: string; value: ListStatus }[];
  value: ListStatus;
  onChange: (value: ListStatus) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="media-status">Status</Label>
      <Select
        value={value}
        onValueChange={(nextValue) => onChange(nextValue as ListStatus)}
        items={statuses}
      >
        <SelectTrigger id="media-status">
          <SelectValue />
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

function ProgressField({
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
    <div className="grid gap-2">
      <Label htmlFor="media-progress">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id="media-progress"
          type="number"
          inputMode="numeric"
          min={0}
          max={hasLimit ? total : undefined}
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue ? String(clampProgress(Number.parseInt(nextValue, 10), total)) : "");
          }}
          className="w-24"
        />
        {hasLimit ? <span className="text-sm text-muted-foreground">of {total}</span> : null}
      </div>
    </div>
  );
}

function RatingField({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">Rating</legend>
      <div className="flex flex-wrap gap-1">
        {SCORE_OPTIONS.map((score) => (
          <button
            type="button"
            key={score}
            onClick={() => onChange(score === value ? 0 : score)}
            className="rounded-sm p-0.5 focus-visible:outline-2 focus-visible:outline-ring"
            aria-label={`Rate ${score} out of 10`}
            aria-pressed={value === score}
          >
            <Star
              className={cn(
                "size-5",
                value >= score ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ReviewField({
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
  const reviewId = useId();
  const spoilersId = useId();

  return (
    <div className="grid gap-2 border-t pt-4">
      <Label htmlFor={reviewId}>Review (optional)</Label>
      <Textarea
        id={reviewId}
        placeholder={`What did you think about this ${MEDIA[mediaType].label.toLowerCase()}?`}
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        rows={4}
      />
      {content.trim() ? (
        <label htmlFor={spoilersId} className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            id={spoilersId}
            type="checkbox"
            checked={containsSpoilers}
            onChange={(event) => onSpoilersChange(event.target.checked)}
          />
          Contains spoilers
        </label>
      ) : null}
    </div>
  );
}
