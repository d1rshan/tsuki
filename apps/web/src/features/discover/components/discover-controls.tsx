"use client";

import { useState } from "react";
import { BookOpen, Tv } from "lucide-react";
import { useQueryState } from "nuqs";

import type { MediaType } from "@tsuki/api/types";

import { MEDIA, MEDIA_TYPES } from "@/features/media/labels";
import { useMediaType } from "@/features/media/hooks/use-media-type";
import { SearchControl } from "@/shared/components/search-control";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function DiscoverControls() {
  const [mediaType, setMediaType] = useMediaType();
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const [isOpen, setIsOpen] = useState(false);
  const expanded = isOpen || Boolean(query);
  const searchLabel = `Search ${MEDIA[mediaType].label.toLowerCase()}`;

  return (
    <div className="flex min-w-0 items-center justify-center gap-2 max-md:w-full md:justify-start md:gap-3">
      <Tabs
        value={mediaType}
        onValueChange={(value) => setMediaType(value as MediaType)}
        className="order-2 shrink-0 md:order-2"
        variant="rounded"
      >
        <TabsList aria-label="Media type" className="max-md:h-10.5">
          {MEDIA_TYPES.map((type) => (
            <TabsTrigger key={type} value={type} aria-label={MEDIA[type].label} className="px-2">
              {type === "ANIME" ? <Tv aria-hidden="true" /> : <BookOpen aria-hidden="true" />}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <SearchControl
        value={query}
        onValueChange={(value) => void setQuery(value || null)}
        expanded={expanded}
        onExpandedChange={(open) => {
          setIsOpen(open);
          if (!open) void setQuery(null);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
        }}
        searchLabel={searchLabel}
        className="order-1"
      />
    </div>
  );
}
