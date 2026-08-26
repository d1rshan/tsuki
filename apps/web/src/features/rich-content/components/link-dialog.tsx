"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

export function LinkDialog({
  editor,
  open,
  onOpenChange,
}: {
  editor: Editor;
  open: boolean;
  onOpenChange: (dialog: null) => void;
}) {
  const [href, setHref] = useState("");
  const isActive = editor.isActive("link");

  // Seed the field with the current link whenever the dialog reopens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setHref(editor.getAttributes("link").href ?? "");
  }

  function save() {
    const trimmed = href.trim();
    if (!trimmed) return;

    // ponytail: light https check here for UX; the API enforces it for real.
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: normalized }).run();
    onOpenChange(null);
  }

  function remove() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onOpenChange(null);
  }

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Add a link</DialogTitle>
          <DialogDescription>Links open in a new tab.</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="rich-content-link-url">URL</FieldLabel>
          <Input
            id="rich-content-link-url"
            type="url"
            placeholder="https://example.com"
            value={href}
            autoFocus
            onChange={(event) => setHref(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && save()}
          />
        </Field>
        <DialogFooter className="flex-row justify-end gap-2">
          {isActive && (
            <Button type="button" variant="ghost" onClick={remove}>
              Remove
            </Button>
          )}
          <Button type="button" onClick={save} disabled={!href.trim()}>
            Save link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
