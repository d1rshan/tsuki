"use client";

import { SearchControl } from "@/shared/components/search-control";

import { usePeopleSearch } from "../hooks/use-people-search";

export function PeopleSearchControls() {
  const [{ search, q }, setSearch] = usePeopleSearch();

  return (
    <SearchControl
      value={q}
      onValueChange={(value) => void setSearch({ q: value || null })}
      expanded={search || Boolean(q)}
      onExpandedChange={(open) =>
        void setSearch(open ? { search: true } : { search: null, q: null })
      }
      searchLabel="Search username"
    />
  );
}
