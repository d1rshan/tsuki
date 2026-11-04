"use client";

import { useState } from "react";

import type { MediaType } from "@tsuki/api/types";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function MediaOgPreview() {
  const [type, setType] = useState<MediaType>("ANIME");
  const [id, setId] = useState("");
  const [selected, setSelected] = useState<{
    id: string;
    type: MediaType;
  } | null>(null);

  return (
    <section className="space-y-4" aria-labelledby="media-og-heading">
      <h3 id="media-og-heading" className="text-sm font-medium text-muted-foreground">
        Anime / manga
      </h3>
      <Tabs value={type} onValueChange={(value) => setType(value as MediaType)}>
        <TabsList aria-label="Media type">
          <TabsTrigger value="ANIME">Anime</TabsTrigger>
          <TabsTrigger value="MANGA">Manga</TabsTrigger>
        </TabsList>
      </Tabs>
      <form
        className="max-w-xl space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSelected({ type, id });
        }}
      >
        <label htmlFor="og-media-id" className="text-sm font-medium">
          Media ID
        </label>
        <div className="flex gap-2">
          <Input
            id="og-media-id"
            value={id}
            onChange={(event) => setId(event.target.value)}
            placeholder="e.g. 21"
            inputMode="numeric"
            pattern="[1-9][0-9]*"
            required
          />
          <Button type="submit">Preview</Button>
        </div>
      </form>
      {selected ? (
        <figure className="space-y-2">
          <figcaption className="text-sm text-muted-foreground">
            /{selected.type.toLowerCase()}/{selected.id}
          </figcaption>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/ui/og-preview/media?type=${selected.type}&id=${selected.id}`}
            alt={`Open Graph preview for ${selected.type.toLowerCase()} ${selected.id}`}
            width={1200}
            height={630}
            className="h-auto w-full rounded-lg border"
          />
        </figure>
      ) : (
        <p className="text-sm text-muted-foreground">
          Enter an ID to preview its Open Graph image.
        </p>
      )}
    </section>
  );
}
