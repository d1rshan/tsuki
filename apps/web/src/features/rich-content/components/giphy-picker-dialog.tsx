"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import type { IGif } from "@giphy/js-types";
import { Grid } from "@giphy/react-components";

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

const CLIENTS: Record<"bio" | "review", GiphyFetch> = {
  bio: new GiphyFetch(env.NEXT_PUBLIC_GIPHY_BIO_KEY),
  review: new GiphyFetch(env.NEXT_PUBLIC_GIPHY_REVIEW_KEY),
};

/** Tracks the scroll container's width for <Grid>, which needs a pixel value. */
function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/**
 * G-rated Giphy search + trending with infinite scroll. Rendered inside
 * DialogContent so closing unmounts state (fresh query next open).
 * Runs client-side as Giphy's terms require; public web keys scoped per
 * section (bio vs review).
 */
function PickerBody({
  preset,
  onSelect,
}: {
  preset: "bio" | "review";
  onSelect: (gif: IGif) => void;
}) {
  const client = CLIENTS[preset];
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query.trim(), 300);
  const [gridRef, width] = useContainerWidth();

  // Offset is handled by Grid's built-in infinite scroll.
  const fetchGifs = useCallback(
    (offset: number) =>
      search
        ? client.search(search, { offset, limit: 24, rating: "g" })
        : client.trending({ offset, limit: 24, rating: "g" }),
    [client, search],
  );

  return (
    <>
      <Field>
        <FieldLabel htmlFor="rich-content-gif-search">Search</FieldLabel>
        <Input
          id="rich-content-gif-search"
          placeholder="Search GIFs…"
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
        />
      </Field>

      <div ref={gridRef} className="min-h-0 flex-1 overflow-y-auto pt-1">
        {width > 0 && (
          <Grid
            // Recreates the grid per search, restarting from offset 0.
            key={search}
            width={width}
            columns={3}
            gutter={8}
            fetchGifs={fetchGifs}
            noLink
            noResultsMessage={
              <p className="py-8 text-center text-sm text-muted-foreground">No GIFs found.</p>
            }
            onGifClick={onSelect}
          />
        )}
      </div>
    </>
  );
}

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
  const apiKey =
    preset === "bio" ? env.NEXT_PUBLIC_GIPHY_BIO_KEY : env.NEXT_PUBLIC_GIPHY_REVIEW_KEY;

  const handleSelect = useCallback(
    (gif: IGif) => {
      // Downsized keeps uploads light; original is often huge.
      const url = gif.images.downsized?.url ?? gif.images.original.url;
      onInsert({ kind: "gif", src: url });
      onOpenChange(null);
    },
    [onInsert, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Insert a GIF</DialogTitle>
          <DialogDescription>Search Giphy for a reaction.</DialogDescription>
        </DialogHeader>

        {apiKey ? (
          <>
            <PickerBody preset={preset} onSelect={handleSelect} />

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
