import type { MediaCompact } from "@tsuki/api/types";

import { parseMediaId } from "./normalize";

type MediaHistoryEntry = Pick<MediaCompact, "id" | "type"> & { entryId: string; search: string };

export function parseMediaHistoryEntry(value: unknown): MediaHistoryEntry | null {
  if (
    !value ||
    typeof value !== "object" ||
    !("entryId" in value) ||
    typeof value.entryId !== "string" ||
    !value.entryId ||
    !("type" in value) ||
    (value.type !== "ANIME" && value.type !== "MANGA") ||
    !("id" in value) ||
    typeof value.id !== "number" ||
    !parseMediaId(String(value.id)) ||
    ("search" in value &&
      (typeof value.search !== "string" || (value.search !== "" && !value.search.startsWith("?"))))
  ) {
    return null;
  }

  return {
    entryId: value.entryId,
    type: value.type,
    id: value.id,
    search: "search" in value ? (value.search as string) : "",
  };
}
