"use client";

import { useEffect, useId, useRef, type FocusEventHandler } from "react";
import { Search, X } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { useHotkey } from "@/shared/hooks/use-hotkey";
import { cn } from "@/shared/lib/utils";

type SearchControlProps = {
  value: string;
  onValueChange: (value: string) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  searchLabel: string;
  className?: string;
  onBlur?: FocusEventHandler<HTMLDivElement>;
};

export function SearchControl({
  value,
  onValueChange,
  expanded,
  onExpandedChange,
  searchLabel,
  className,
  onBlur,
}: SearchControlProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useHotkey("/", () => {
    onExpandedChange(true);
    inputRef.current?.focus({ preventScroll: true });
  });

  useEffect(() => {
    if (expanded) inputRef.current?.focus({ preventScroll: true });
  }, [expanded]);

  function closeSearch() {
    onExpandedChange(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  return (
    <InputGroup
      data-search-expanded={expanded}
      className={cn(
        "group/search w-10.5 shrink-0 overflow-hidden rounded-full has-[>[data-align=inline-start]]:[&>input]:pl-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0 transition-[width] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:h-10.5 max-md:data-[search-expanded=true]:w-[min(18rem,calc(100vw-7.25rem))] motion-reduce:transition-none md:data-[search-expanded=true]:w-56 lg:data-[search-expanded=true]:w-60",
        className,
      )}
      onBlur={onBlur}
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
          aria-controls={id}
          onClick={() => {
            onExpandedChange(true);
            inputRef.current?.focus();
          }}
        >
          <Search aria-hidden="true" className="text-muted-foreground" />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        ref={inputRef}
        value={value}
        inert={!expanded}
        aria-hidden={!expanded}
        onChange={(event) => onValueChange(event.target.value)}
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
  );
}
