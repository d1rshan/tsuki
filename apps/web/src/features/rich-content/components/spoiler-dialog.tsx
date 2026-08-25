"use client";

import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

/** Asks for the optional label readers see before choosing to reveal. */
export function SpoilerDialog({
  open,
  onApply,
  onOpenChange,
}: {
  open: boolean;
  onApply: (label: string) => void;
  onOpenChange: (dialog: null) => void;
}) {
  const [label, setLabel] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setLabel("");
          onOpenChange(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Add a spoiler</DialogTitle>
          <DialogDescription>
            The content stays hidden until a reader taps to reveal it.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="rich-content-spoiler-label">Label</FieldLabel>
          <Input
            id="rich-content-spoiler-label"
            placeholder="e.g. Episode 12"
            value={label}
            autoFocus
            maxLength={100}
            onChange={(event) => setLabel(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && (onApply(label), onOpenChange(null))}
          />
          <FieldDescription>Optional — hints at what readers are about to reveal.</FieldDescription>
        </Field>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => {
              onApply(label);
              setLabel("");
              onOpenChange(null);
            }}
          >
            Add spoiler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
