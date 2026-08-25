"use client";

import { useEffect, useState } from "react";

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

export type InsertAttrs = { kind: string; src: string; alt?: string | null };

/** Shared dialog for inserting an image (with required alt text) or a video URL. */
export function MediaEmbedDialog({
  kind,
  open,
  onInsert,
  onOpenChange,
}: {
  kind: "image" | "video";
  open: boolean;
  onInsert: (attrs: InsertAttrs) => void;
  onOpenChange: (dialog: null) => void;
}) {
  const isImage = kind === "image";
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");

  useEffect(() => {
    if (open) {
      setSrc("");
      setAlt("");
    }
  }, [open]);

  const valid = /^https:\/\/\S+/.test(src.trim()) && (!isImage || alt.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isImage ? "Insert image" : "Embed video"}</DialogTitle>
          <DialogDescription>
            {isImage
              ? "Use an HTTPS image URL. Alt text describes the image for readers who can't see it."
              : "Supports YouTube and Vimeo URLs."}
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor={`rich-content-${kind}-url`}>URL</FieldLabel>
          <Input
            id={`rich-content-${kind}-url`}
            type="url"
            placeholder={
              isImage ? "https://example.com/image.jpg" : "https://www.youtube.com/watch?v=…"
            }
            value={src}
            autoFocus
            onChange={(event) => setSrc(event.target.value)}
          />
        </Field>
        {isImage && (
          <Field>
            <FieldLabel htmlFor="rich-content-image-alt">Alt text</FieldLabel>
            <Input
              id="rich-content-image-alt"
              placeholder="Describe the image"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
            />
            <FieldDescription>Required — keep it short and useful.</FieldDescription>
          </Field>
        )}
        <DialogFooter>
          <Button
            type="button"
            disabled={!valid}
            onClick={() => {
              onInsert({ kind, src: src.trim(), ...(isImage ? { alt: alt.trim() } : {}) });
              onOpenChange(null);
            }}
          >
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
