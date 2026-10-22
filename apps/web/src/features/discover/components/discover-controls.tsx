"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Search, Tv, X } from "lucide-react";
import { useQueryState } from "nuqs";

import type { MediaType } from "@tsuki/api/types";

import { MEDIA, MEDIA_TYPES } from "@/features/media/labels";
import { useMediaType } from "@/features/media/hooks/use-media-type";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useHotkey } from "@/shared/hooks/use-hotkey";

export function DiscoverControls() {
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [mediaType, setMediaType] = useMediaType();
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const [isOpen, setIsOpen] = useState(false);
  const expanded = isOpen || Boolean(query);
  const searchLabel = `Search ${MEDIA[mediaType].label.toLowerCase()}`;

  useHotkey("/", () => {
    setIsOpen(true);
    inputRef.current?.focus();
  });

  useEffect(() => {
    if (expanded) inputRef.current?.focus({ preventScroll: true });
  }, [expanded]);

  function closeSearch() {
    void setQuery(null);
    setIsOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className="flex min-w-0 items-center gap-2 md:gap-3">
      <InputGroup
        data-search-expanded={expanded}
        className="group/search w-10.5 shrink-0 overflow-hidden rounded-full has-[>[data-align=inline-start]]:[&>input]:pl-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0 transition-[width] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] data-[search-expanded=true]:w-[min(15rem,calc(100vw-9rem))] motion-reduce:transition-none md:data-[search-expanded=true]:w-56 lg:data-[search-expanded=true]:w-60"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeSearch();
          }
        }}
      >
        <InputGroupAddon className="w-10.5 shrink-0 pl-0 has-[>button]:ml-0">
          <InputGroupButton
            ref={triggerRef}
            size="icon-sm"
            className="rounded-full"
            aria-label={searchLabel}
            aria-expanded={expanded}
            aria-controls="discover-search"
            onClick={() => {
              setIsOpen(true);
              inputRef.current?.focus();
            }}
          >
            <Search aria-hidden="true" className="text-muted-foreground" />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupInput
          id="discover-search"
          ref={inputRef}
          value={query}
          inert={!expanded}
          aria-hidden={!expanded}
          onChange={(event) => void setQuery(event.target.value || null)}
          placeholder={searchLabel}
          aria-label={searchLabel}
          className="h-full min-w-0 text-base opacity-0 transition-opacity duration-200 group-data-[search-expanded=true]/search:opacity-100 motion-reduce:transition-none"
        />
        <InputGroupAddon
          align="inline-end"
          className="hidden pr-1.25 group-data-[search-expanded=true]/search:flex"
          inert={!expanded}
        >
          <InputGroupButton
            size="icon-sm"
            className="rounded-full"
            aria-label="Close search"
            onClick={closeSearch}
          >
            <X aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <Tabs
        value={mediaType}
        onValueChange={(value) => setMediaType(value as MediaType)}
        className="shrink-0 max-md:group-has-[[data-search-expanded=true]]/navbar:hidden"
        variant="rounded"
      >
        <TabsList aria-label="Media type">
          {MEDIA_TYPES.map((type) => (
            <TabsTrigger key={type} value={type} aria-label={MEDIA[type].label} className="px-2">
              {type === "ANIME" ? <Tv aria-hidden="true" /> : <BookOpen aria-hidden="true" />}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
