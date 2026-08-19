"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Plus, Star } from "lucide-react";

import type { ListStatus, MediaType } from "@tsuki/api/types";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

import {
  SCORE_OPTIONS,
  clampProgress,
  createActivityForm,
  hasLoggedActivity,
  type ActivityForm,
} from "../activity";
import type { MediaActivity } from "../hooks/use-media-activity";
import { useSaveMediaActivityMutation } from "../hooks/use-save-media-activity-mutation";
import { MEDIA } from "../media";

export function LogMediaDialog({
  activity,
  mediaId,
  mediaType,
  total,
}: {
  activity: MediaActivity;
  mediaId: number;
  mediaType: MediaType;
  total?: number | null;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(() =>
    createActivityForm(mediaType, activity.entry, activity.review),
  );
  const config = MEDIA[mediaType];
  const isFavorite = activity.entry?.isFavorite ?? false;
  const hasActivity = hasLoggedActivity(mediaType, activity.entry, activity.review);
  const saveMutation = useSaveMediaActivityMutation(mediaType, mediaId);

  function updateForm(updates: Partial<ActivityForm>) {
    setForm((current) => ({ ...current, ...updates }));
  }

  function handleOpenChange(nextIsOpen: boolean) {
    if (nextIsOpen && !activity.isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsOpen(nextIsOpen);
    if (nextIsOpen) {
      setForm(createActivityForm(mediaType, activity.entry, activity.review));
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button disabled={activity.isPending} className="flex-1" />}
        aria-label={hasActivity ? `Edit ${config.label.toLowerCase()} log` : undefined}
      >
        {hasActivity ? <Check data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
        {hasActivity ? "Edit log" : "Add to list"}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[20rem]">
        <DialogHeader>
          <DialogTitle>Log {config.label}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate(
              { form, isFavorite, review: activity.review, total },
              { onSuccess: (result) => result === "saved" && setIsOpen(false) },
            );
          }}
        >
          <FieldGroup>
            <FieldGroup className="sm:grid sm:grid-cols-[3fr_2fr]">
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
            </FieldGroup>

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
                {saveMutation.isPending ? (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                ) : null}
                Save
              </Button>
            </div>
          </FieldGroup>
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
  const id = useId();

  return (
    <Field>
      <FieldLabel htmlFor={id}>Status</FieldLabel>
      <Select
        value={value}
        onValueChange={(nextValue) => onChange(nextValue as ListStatus)}
        items={statuses}
      >
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
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
  const id = useId();
  const hasLimit = typeof total === "number" && total > 0;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={hasLimit ? total : undefined}
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue ? String(clampProgress(Number.parseInt(nextValue, 10), total)) : "");
          }}
          className={cn(hasLimit && "pr-16")}
        />
        {hasLimit ? (
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-muted-foreground">
            of {total}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

function RatingField({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <FieldSet>
      <FieldLegend variant="label">Rating</FieldLegend>
      <div className="flex flex-wrap gap-1">
        {SCORE_OPTIONS.map((score) => (
          <button
            type="button"
            key={score}
            onClick={() => onChange(score === value ? 0 : score)}
            className="group rounded-sm p-0.5 focus-visible:outline-2 focus-visible:outline-ring"
            aria-label={`Rate ${score} out of 10`}
            aria-pressed={value === score}
          >
            <Star
              className={cn(
                "size-5",
                value >= score
                  ? "fill-primary text-primary"
                  : "text-muted-foreground group-hover:text-primary",
              )}
            />
          </button>
        ))}
      </div>
    </FieldSet>
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
    <>
      <FieldSeparator />
      <Field>
        <FieldLabel htmlFor={reviewId}>Review</FieldLabel>
        <Textarea
          id={reviewId}
          placeholder={`What did you think about this ${MEDIA[mediaType].label.toLowerCase()}?`}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          rows={3}
        />
      </Field>

      {content.trim() ? (
        <Field orientation="horizontal">
          <Checkbox id={spoilersId} checked={containsSpoilers} onCheckedChange={onSpoilersChange} />
          <FieldLabel htmlFor={spoilersId}>Contains spoilers</FieldLabel>
        </Field>
      ) : null}
    </>
  );
}
