"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
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

import { SCORE_OPTIONS, clampProgress, createActivityForm, hasLoggedActivity } from "../activity";
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
  const formId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const config = MEDIA[mediaType];
  const isFavorite = activity.entry?.isFavorite ?? false;
  const hasActivity = hasLoggedActivity(mediaType, activity.entry, activity.review);
  const saveMutation = useSaveMediaActivityMutation(mediaType, mediaId);
  const form = useForm({
    defaultValues: createActivityForm(mediaType, activity.entry, activity.review),
    onSubmit: async ({ value }) => {
      const result = await saveMutation.mutateAsync({
        form: value,
        isFavorite,
        review: activity.review,
        total,
      });

      if (result === "saved") setIsOpen(false);
    },
  });

  function handleOpenChange(nextIsOpen: boolean) {
    if (nextIsOpen && !activity.isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsOpen(nextIsOpen);
    if (nextIsOpen) {
      form.reset(createActivityForm(mediaType, activity.entry, activity.review));
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
            void form.handleSubmit().catch(() => undefined);
          }}
        >
          <FieldGroup>
            <FieldGroup className="sm:grid sm:grid-cols-[3fr_2fr]">
              <form.Field name="status">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={`${formId}-status`}>Status</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as ListStatus)}
                      items={config.statuses}
                    >
                      <SelectTrigger id={`${formId}-status`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {config.statuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
              <form.Field name="progress">
                {(field) => {
                  const hasLimit = typeof total === "number" && total > 0;

                  return (
                    <Field>
                      <FieldLabel htmlFor={`${formId}-progress`}>{config.unitLong}</FieldLabel>
                      <div className="relative">
                        <Input
                          id={`${formId}-progress`}
                          name={field.name}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={hasLimit ? total : undefined}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.handleChange(
                              value ? String(clampProgress(Number.parseInt(value, 10), total)) : "",
                            );
                          }}
                          className={cn(hasLimit && "pr-16")}
                        />
                        {hasLimit && (
                          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-sm text-muted-foreground">
                            of {total}
                          </span>
                        )}
                      </div>
                    </Field>
                  );
                }}
              </form.Field>
            </FieldGroup>

            <form.Field name="score">
              {(field) => (
                <FieldSet>
                  <FieldLegend variant="label">Rating</FieldLegend>
                  <div className="flex flex-wrap gap-1">
                    {SCORE_OPTIONS.map((score) => (
                      <button
                        type="button"
                        key={score}
                        onClick={() => field.handleChange(score === field.state.value ? 0 : score)}
                        className="group rounded-sm p-0.5 focus-visible:outline-2 focus-visible:outline-ring"
                        aria-label={`Rate ${score} out of 10`}
                        aria-pressed={field.state.value === score}
                      >
                        <Star
                          className={cn(
                            "size-5",
                            field.state.value >= score
                              ? "fill-primary text-primary"
                              : "text-muted-foreground group-hover:text-primary",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </FieldSet>
              )}
            </form.Field>

            <form.Field name="reviewContent">
              {(field) => (
                <>
                  <FieldSeparator />
                  <Field>
                    <FieldLabel htmlFor={`${formId}-review`}>Review</FieldLabel>
                    <Textarea
                      id={`${formId}-review`}
                      name={field.name}
                      placeholder={`What did you think about this ${config.label.toLowerCase()}?`}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      rows={3}
                    />
                  </Field>
                  {field.state.value.trim() && (
                    <form.Field name="containsSpoilers">
                      {(spoilersField) => (
                        <Field orientation="horizontal">
                          <Checkbox
                            id={`${formId}-spoilers`}
                            name={spoilersField.name}
                            checked={spoilersField.state.value}
                            onCheckedChange={spoilersField.handleChange}
                          />
                          <FieldLabel htmlFor={`${formId}-spoilers`}>Contains spoilers</FieldLabel>
                        </Field>
                      )}
                    </form.Field>
                  )}
                </>
              )}
            </form.Field>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                      <LoaderCircle data-icon="inline-start" className="animate-spin" />
                    )}
                    Save
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
