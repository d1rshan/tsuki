import { Search, X } from "lucide-react";

import type { MediaType } from "@tsuki/api/types";

import { Button } from "@/components/ui/button";

type NavigationSearchProps = {
  mediaType: MediaType;
  onChange: (value: string) => void;
  onClose: () => void;
  query: string;
};

export function NavigationSearch({ mediaType, onChange, onClose, query }: NavigationSearchProps) {
  return (
    <div className="flex h-full w-full items-center gap-3">
      <Search className="size-5 shrink-0 text-muted-foreground" />
      <input
        autoFocus
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Search ${mediaType.toLowerCase()}...`}
        aria-label={`Search ${mediaType.toLowerCase()}`}
        className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        aria-label="Close search"
      >
        <X />
      </Button>
    </div>
  );
}
