"use client";

import { useRef } from "react";
import { Eye, EyeOff, Search } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";

import type { MediaType } from "@tsuki/api/types";

import { MEDIA, MEDIA_TYPES } from "@/features/media/labels";
import { useMediaType } from "@/features/media/hooks/use-media-type";
import { Button } from "@/shared/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group";
import { Kbd } from "@/shared/components/ui/kbd";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useHotkey } from "@/shared/hooks/use-hotkey";

export function DiscoverHero() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useMediaType();
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  // ponytail: nsfw filters search only — trending ignores it until the API grows the flag.
  const [includeNsfw, setIncludeNsfw] = useQueryState("nsfw", parseAsBoolean.withDefault(false));

  useHotkey("mod+k", () => inputRef.current?.focus());

  function handleEscape() {
    void setQuery(null);
    inputRef.current?.blur();
  }

  return (
    <section className="flex flex-wrap items-center gap-3" aria-label="Search">
      <InputGroup className="h-11 w-full min-w-56 max-w-md rounded-xl bg-muted/30">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          value={query}
          onChange={(event) => void setQuery(event.target.value || null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") handleEscape();
          }}
          placeholder={`Search ${MEDIA[mediaType].label.toLowerCase()}...`}
          aria-label={`Search ${MEDIA[mediaType].label.toLowerCase()}`}
          className="h-full"
        />
        <InputGroupAddon align="inline-end" className="hidden md:flex">
          <Kbd>⌘</Kbd>
          <span aria-hidden className="text-[0.65rem]">
            +
          </span>
          <Kbd>K</Kbd>
        </InputGroupAddon>
      </InputGroup>

      <Tabs
        value={mediaType}
        onValueChange={(value) => setMediaType(value as MediaType)}
        className="ml-auto shrink-0"
      >
        <TabsList>
          {MEDIA_TYPES.map((type) => (
            <TabsTrigger key={type} value={type}>
              {MEDIA[type].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Button
        type="button"
        size="lg"
        variant={includeNsfw ? "default" : "outline"}
        onClick={() => void setIncludeNsfw(!includeNsfw)}
        aria-pressed={includeNsfw}
        className="h-11 rounded-xl px-4"
      >
        {includeNsfw ? <Eye data-icon="inline-start" /> : <EyeOff data-icon="inline-start" />}
        NSFW
      </Button>
    </section>
  );
}
