import { Search } from "lucide-react";

import type { MediaType } from "@tsuki/api/types";

import { Kbd } from "@/components/ui/kbd";

type NavigationSearchProps = {
  mediaType: MediaType;
  onChange: (value: string) => void;
  onClose: () => void;
  query: string;
};

export function NavigationSearch({ mediaType, onChange, onClose, query }: NavigationSearchProps) {
  return (
    <div className="flex h-full w-full items-center gap-3">
      <Search className="size-5 text-muted-foreground" />
      <input
        autoFocus
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Search ${mediaType.toLowerCase()}...`}
        aria-label={`Search ${mediaType.toLowerCase()}`}
        className="h-full flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close search"
        className="transition-opacity hover:opacity-80"
      >
        <Kbd>Esc</Kbd>
      </button>
    </div>
  );
}
