"use client";

import { useRef } from "react";
import { BookOpen, Search, Tv } from "lucide-react";
import { useQueryState } from "nuqs";

import type { MediaType } from "@tsuki/api/types";

import { MEDIA, MEDIA_TYPES } from "@/features/media/labels";
import { useMediaType } from "@/features/media/hooks/use-media-type";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group";
import { Kbd } from "@/shared/components/ui/kbd";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useHotkey } from "@/shared/hooks/use-hotkey";

export function DiscoverHero() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useMediaType();
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });

  useHotkey("/", () => inputRef.current?.focus());

  function handleEscape() {
    void setQuery(null);
    inputRef.current?.blur();
  }

  return (
    <>
      <section className="flex flex-wrap items-center gap-3" aria-label="Search">
        <InputGroup className="w-full min-w-56 md:w-auto md:max-w-md md:flex-1">
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            ref={inputRef}
            value={query}
            onChange={(event) => void setQuery(event.target.value || null)}
            onKeyDown={(event) => {
              if (event.key === "Escape") handleEscape();
            }}
            placeholder={`Search ${MEDIA[mediaType].label.toLowerCase()}`}
            aria-label={`Search ${MEDIA[mediaType].label.toLowerCase()}`}
            className="h-full text-base"
          />
          <InputGroupAddon align="inline-end" className="hidden md:flex">
            <Kbd>/</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </section>

      <div className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center md:top-6">
        <Tabs
          value={mediaType}
          onValueChange={(value) => setMediaType(value as MediaType)}
          className="pointer-events-auto"
          variant="rounded"
        >
          <TabsList>
            {MEDIA_TYPES.map((type) => (
              <TabsTrigger key={type} value={type} aria-label={MEDIA[type].label} className="px-2">
                {type === "ANIME" ? <Tv aria-hidden="true" /> : <BookOpen aria-hidden="true" />}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </>
  );
}
