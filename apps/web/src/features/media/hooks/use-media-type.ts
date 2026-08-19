"use client";

import { useEffect, useSyncExternalStore } from "react";
import { parseAsStringEnum, useQueryState } from "nuqs";

import type { MediaType } from "@tsuki/api/types";

import { MEDIA_TYPES } from "../media";

const STORAGE_KEY = "discover-media-type";
const CHANGE_EVENT = "tsuki:media-type-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getStoredMediaType(): MediaType {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "MANGA" ? "MANGA" : "ANIME";
  } catch {
    return "ANIME";
  }
}

function getDefaultMediaType(): MediaType {
  return "ANIME";
}

function storeMediaType(value: MediaType) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // The URL remains the source of truth when storage is unavailable.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useMediaType({ persistQuery = true }: { persistQuery?: boolean } = {}) {
  const storedMediaType = useSyncExternalStore(subscribe, getStoredMediaType, getDefaultMediaType);
  const [mediaTypeParam, setMediaTypeParam] = useQueryState(
    "type",
    parseAsStringEnum<MediaType>([...MEDIA_TYPES]),
  );
  const mediaType = mediaTypeParam ?? storedMediaType;

  useEffect(() => {
    if (persistQuery && mediaTypeParam) storeMediaType(mediaTypeParam);
  }, [mediaTypeParam, persistQuery]);

  function setMediaType(value: MediaType) {
    storeMediaType(value);
    void setMediaTypeParam(value);
  }

  return [mediaType, setMediaType] as const;
}
