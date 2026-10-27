"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Check, LoaderCircle, NotebookPen, Plus } from "lucide-react";

import type { ListStatus, MediaType } from "@tsuki/api/types";

import {
  useDiscardableDialog,
  useUnloadWarning,
} from "@/features/rich-content/components/discard-changes";
import { RichContentEditor } from "@/features/rich-content/components/rich-content-editor";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Rating } from "@/shared/components/ui/rating";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

import {
  clampProgress,
  completionStatus,
  createActivityForm,
  hasLoggedActivity,
} from "../activity";
import type { MediaActivity } from "../hooks/use-media-activity";
import { useSaveMediaActivityMutation } from "../hooks/use-save-media-activity-mutation";
import { MEDIA } from "../media";

export function LogMediaDialog({
  activity,
  mediaId,
  mediaType,
  total,
  compact = false,
}: {
  activity: MediaActivity;
  mediaId: number;
  mediaType: MediaType;
  total?: number | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const formId = useId();
  const config = MEDIA[mediaType];
  const isFavorite = activity.entry?.isFavorite ?? false;
  const hasActivity = hasLoggedActivity(mediaType, activity.entry, activity.review);
  const saveMutation = useSaveMediaActivityMutation(mediaType, mediaId);
  const form = useForm({
    defaultValues: createActivityForm(mediaType, activity.entry, activity.review, total),
    onSubmit: async ({ value }) => {
      const result = await saveMutation.mutateAsync({
        form: value,
        isFavorite,
        review: activity.review,
        total,
      });

      if (result === "saved") dialog.close();
    },
  });
  const dialog = useDiscardableDialog(
    form.state.isDirty,
    () => form.reset(createActivityForm(mediaType, activity.entry, activity.review, total)),
    false,
  );

  useUnloadWarning(form.state.isDirty);

  function handleOpenChange(nextIsOpen: boolean) {
    if (nextIsOpen && !activity.isAuthenticated) {
      router.push("/login");
      return;
    }

    dialog.handleOpenChange(nextIsOpen);
  }

  return (
    <Dialog open={dialog.isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            disabled={activity.isPending}
            className="flex-1"
            size={compact ? "sm" : "default"}
            variant={compact ? "secondary" : "default"}
          />
        }
        aria-label={
          hasActivity
            ? `Edit ${config.label.toLowerCase()} log`
            : `Log ${config.label.toLowerCase()}`
        }
      >
        {compact ? (
          <NotebookPen data-icon="inline-start" />
        ) : hasActivity ? (
          <Check data-icon="inline-start" />
        ) : (
          <Plus data-icon="inline-start" />
        )}
        {hasActivity ? "Edit log" : compact ? "Log" : "Add to list"}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
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
                      onValueChange={(value) =>
                        field.handleChange(
                          completionStatus(
                            Number.parseInt(form.getFieldValue("progress"), 10),
                            total,
                            value as ListStatus,
                          ),
                        )
                      }
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
                            form.setFieldValue(
                              "status",
                              completionStatus(
                                clampProgress(Number.parseInt(value, 10), total),
                                total,
                                form.getFieldValue("status"),
                              ),
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
                  <Rating value={field.state.value} onValueChange={field.handleChange} />
                </FieldSet>
              )}
            </form.Field>

            <form.Field name="review">
              {(field) => (
                <>
                  <Field>
                    <FieldLabel>Review</FieldLabel>
                    <RichContentEditor
                      key={dialog.editorResetKey}
                      preset="review"
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                      disabled={saveMutation.isPending}
                      ariaLabel="Review"
                    />
                  </Field>
                </>
              )}
            </form.Field>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
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
