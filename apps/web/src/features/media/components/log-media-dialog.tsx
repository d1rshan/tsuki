"use client";

import { useId, useLayoutEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, LoaderCircle, Plus, Star } from "lucide-react";
import { toast } from "sonner";

import type { LibraryEntry, ListStatus, MediaType, Review } from "@tsuki/api/types";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/shared/lib/utils";

import {
  SCORE_OPTIONS,
  clampProgress,
  createActivityForm,
  createLogMediaInput,
  hasLoggedActivity,
  saveMediaActivity,
  type ActivityForm,
} from "../activity";
import { deleteReviewAction, logMediaAction, submitReviewAction } from "../actions";
import { MEDIA } from "../media";
import { mediaKeys } from "../query-keys";

const ReviewEditor = dynamic(
  () => import("./review-editor").then((module) => module.ReviewEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[180px] rounded-lg border bg-muted"
        role="status"
        aria-label="Loading review editor"
      />
    ),
  },
);

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
  const hasActivity = hasLoggedActivity(mediaType, entry, review);

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
      <DialogContent className="max-h-[90vh] gap-3 overflow-y-auto border-white/10 bg-background/80 backdrop-blur-xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Log {config.label}
          </DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-[3fr_2fr]">
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
          </div>
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
        <SelectTrigger id="media-status" className="w-full">
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
      <div className="relative">
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
          className={cn(
            "w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            hasLimit && "pr-16",
          )}
        />
        {hasLimit ? (
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-muted-foreground">
            of {total}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RatingField({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-left text-sm font-medium">Rating</legend>
      <div className="flex flex-wrap gap-1">
        {SCORE_OPTIONS.map((score) => (
          <button
            type="button"
            key={score}
            onClick={() => onChange(score === value ? 0 : score)}
            className="group rounded-sm p-0.5 transition-transform hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-ring"
            aria-label={`Rate ${score} out of 10`}
            aria-pressed={value === score}
          >
            <Star
              className={cn(
                "size-5",
                value >= score
                  ? "fill-primary text-primary"
                  : "text-muted-foreground group-hover:fill-primary/20 group-hover:text-primary",
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
  const spoilersId = useId();

  return (
    <div className="grid gap-2 border-t pt-3">
      <ReviewEditor
        placeholder={`What did you think about this ${MEDIA[mediaType].label.toLowerCase()}?`}
        value={content}
        onChange={onContentChange}
      />
      {content.trim() ? (
        <div className="flex items-center gap-2">
          <Checkbox id={spoilersId} checked={containsSpoilers} onCheckedChange={onSpoilersChange} />
          <Label htmlFor={spoilersId} className="cursor-pointer text-sm font-normal">
            Contains spoilers
          </Label>
        </div>
      ) : null}
    </div>
  );
}
