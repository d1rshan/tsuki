"use client";

import type { ComponentProps } from "react";
import Link from "next/link";

import type { Media, MediaCompact } from "@tsuki/api/types";

import { mediaHref } from "../media";
import { useMediaNavigation } from "./media-navigation-provider";

export function MediaLink({
  media,
  morphId,
  onNavigate,
  ...props
}: Omit<ComponentProps<typeof Link>, "href" | "media"> & {
  media: Media | Pick<MediaCompact, "id" | "type">;
  morphId?: string;
}) {
  const openMedia = useMediaNavigation();

  return (
    <Link
      {...props}
      href={mediaHref(media.type, media.id)}
      prefetch={false}
      onNavigate={
        onNavigate ??
        ((event) => {
          if (!openMedia) return;
          event.preventDefault();
          openMedia(media, morphId);
        })
      }
    />
  );
}
