"use client";

import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

export function usePeopleSearch() {
  return useQueryStates({
    search: parseAsBoolean.withDefault(false),
    q: parseAsString.withDefault(""),
  });
}
