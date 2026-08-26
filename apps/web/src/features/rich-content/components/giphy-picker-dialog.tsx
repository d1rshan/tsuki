"use client";

import { useEffect, useState } from "react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import type { IGif } from "@giphy/js-types";

import { env } from "@tsuki/env/web";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import type { InsertAttrs } from "./insert-dialogs";

const GIPHY_KEYS: Record<"bio" | "review", string> = {
  bio: env.NEXT_PUBLIC_GIPHY_BIO_KEY,
  review: env.NEXT_PUBLIC_GIPHY_REVIEW_KEY,
};

/**
 * G-rated Giphy search + trending. Runs client-side as Giphy's terms require;
 * public web keys scoped per section (bio vs review).
 */
export function GiphyPickerDialog({
  preset,
  open,
  onInsert,
  onOpenChange,
}: {
  preset: "bio" | "review";
  open: boolean;
  onInsert: (attrs: InsertAttrs) => void;
  onOpenChange: (dialog: null) => void;
}) {
  const apiKey = GIPHY_KEYS[preset];
  // `loadedFor` tracks which query the results belong to; loading is derived.
  const [{ query, loadedFor, gifs }, setPicker] = useState<{
    query: string;
    loadedFor: string | null;
    gifs: IGif[];
  }>({ query: "", loadedFor: null, gifs: [] });
  const search = useDebouncedValue(query.trim(), 300);

  // Fresh search whenever the dialog reopens (React's adjust-state-on-prop-change).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setPicker({ query: "", loadedFor: null, gifs: [] });
  }

  useEffect(() => {
    if (!open || !apiKey) return;

    const client = new GiphyFetch(apiKey);
    const request = search
      ? client.search(search, { rating: "g", limit: 24 })
      : client.trending({ rating: "g", limit: 24 });

    request
      .then((result) => setPicker((p) => ({ ...p, loadedFor: search, gifs: result.data })))
      .catch(() => setPicker((p) => ({ ...p, loadedFor: search, gifs: [] })));
  }, [open, search, apiKey]);

  const isLoading = open && loadedFor !== search;

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Insert a GIF</DialogTitle>
          <DialogDescription>Search Giphy for a reaction.</DialogDescription>
        </DialogHeader>

        {apiKey ? (
          <>
            <Field>
              <FieldLabel htmlFor="rich-content-gif-search">Search</FieldLabel>
              <Input
                id="rich-content-gif-search"
                placeholder="Search GIFs…"
                value={query}
                autoFocus
                onChange={(event) => setPicker((p) => ({ ...p, query: event.target.value }))}
              />
            </Field>

            <div className="grid min-h-0 flex-1 grid-cols-3 content-start gap-2 overflow-y-auto pt-1">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  aria-label={`Insert GIF: ${gif.title || "untitled"}`}
                  className="overflow-hidden rounded-md border bg-muted transition hover:border-primary hover:ring-1 hover:ring-primary/40"
                  onClick={() => {
                    // Downsized keeps uploads light; original is often huge.
                    const url = gif.images.downsized?.url ?? gif.images.original.url;
                    onInsert({ kind: "gif", src: url });
                    onOpenChange(null);
                  }}
                >
                  <img
                    src={gif.images.fixed_width_small.url}
                    alt={gif.title || "GIF"}
                    loading="lazy"
                    className="h-auto w-full"
                  />
                </button>
              ))}
              {isLoading && (
                <p className="col-span-3 py-8 text-center text-sm text-muted-foreground">
                  Loading…
                </p>
              )}
              {!isLoading && !gifs.length && (
                <p className="col-span-3 py-8 text-center text-sm text-muted-foreground">
                  No GIFs found.
                </p>
              )}
            </div>

            <p className="pt-2 text-center text-xs text-muted-foreground">
              Powered by{" "}
              <a
                href="https://giphy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline-offset-2 hover:underline"
              >
                GIPHY
              </a>
            </p>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            GIF search is not configured. Set the Giphy key for this section to enable it.
          </p>
        )}

        <Button type="button" variant="ghost" onClick={() => onOpenChange(null)}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
