"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import type { IGif } from "@giphy/js-types";
import { Grid } from "@giphy/react-components";

import { env } from "@tsuki/env/web";
import type { RichContentPresetName } from "@tsuki/rich-content";

import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import type { InsertAttrs } from "./insert-dialogs";

const CLIENTS: Record<RichContentPresetName, GiphyFetch> = {
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
  preset: RichContentPresetName;
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
      <Input
        id="rich-content-gif-search"
        aria-label="Search GIFs"
        placeholder="Search GIFs…"
        value={query}
        autoFocus
        onChange={(event) => setQuery(event.target.value)}
      />

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
  preset: RichContentPresetName;
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
      <DialogContent
        aria-label="GIF picker"
        className="flex h-[80vh] max-h-[80vh] flex-col overflow-hidden sm:max-w-lg"
      >
        {apiKey ? (
          <>
            <PickerBody preset={preset} onSelect={handleSelect} />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
