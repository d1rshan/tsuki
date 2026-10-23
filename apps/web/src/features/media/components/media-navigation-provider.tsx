"use client";

import { createContext, Suspense, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import type { Media, MediaCompact } from "@tsuki/api/types";

import { MediaBackgroundContext } from "../hooks/use-media-background-search";
import { mediaHref } from "../media";
import { parseMediaHistoryEntry } from "../media-history";
import { MediaLayoutGroup } from "./media-layout-group";
import { MediaModalDetails } from "./media-modal-details";

type ModalMedia = Media | Pick<MediaCompact, "type" | "id">;
type ModalEntry = { media: ModalMedia; search: string; morphId?: string };

const MediaNavigationContext = createContext<
  ((media: ModalMedia, morphId?: string) => void) | null
>(null);

export function useMediaNavigation() {
  return useContext(MediaNavigationContext);
}

export function MediaNavigationProvider({ children }: { children: React.ReactNode }) {
  const entries = useRef(new Map<string, ModalEntry>());
  const initialized = useRef(false);
  const [selection, setSelection] = useState<ModalEntry | null>(null);

  useEffect(() => {
    // A reload turns this entry into a canonical full page, including on Forward.
    if (!initialized.current) {
      initialized.current = true;
      if (window.history.state?.tsukiMediaModal) {
        const state = { ...window.history.state };
        delete state.tsukiMediaModal;
        window.history.replaceState(state, "");
      }
    }

    function restoreMedia(event: PopStateEvent) {
      const entry = parseMediaHistoryEntry(event.state?.tsukiMediaModal);
      setSelection(
        entry
          ? (entries.current.get(entry.entryId) ?? { media: entry, search: entry.search })
          : null,
      );
    }

    window.addEventListener("popstate", restoreMedia);
    return () => window.removeEventListener("popstate", restoreMedia);
  }, []);

  function openMedia(nextMedia: ModalMedia, morphId?: string) {
    const entryId = crypto.randomUUID();
    const entry = { media: nextMedia, search: window.location.search, morphId };
    entries.current.set(entryId, entry);
    // Keep the background route mounted; direct visits still use the server page.
    window.history.pushState(
      {
        tsukiMediaModal: { entryId, type: nextMedia.type, id: nextMedia.id, search: entry.search },
      },
      "",
      mediaHref(nextMedia.type, nextMedia.id),
    );
    setSelection(entry);
  }

  return (
    <MediaLayoutGroup>
      <MediaNavigationContext value={openMedia}>
        <MediaBackgroundContext
          value={
            selection
              ? {
                  mediaPath: mediaHref(selection.media.type, selection.media.id),
                  search: selection.search,
                }
              : null
          }
        >
          {children}
        </MediaBackgroundContext>
        <Suspense fallback={null}>
          <ActiveMediaModal selection={selection} />
        </Suspense>
      </MediaNavigationContext>
    </MediaLayoutGroup>
  );
}

function ActiveMediaModal({ selection }: { selection: ModalEntry | null }) {
  const pathname = usePathname();
  const media = selection?.media;
  const isActive = media && pathname === mediaHref(media.type, media.id);

  return (
    <AnimatePresence initial={false}>
      {isActive && (
        <MediaModalDetails
          key={`${media.type}-${media.id}`}
          media={media}
          morphId={selection.morphId}
        />
      )}
    </AnimatePresence>
  );
}
