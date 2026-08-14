import { ExternalLink } from "lucide-react";

import type { Media } from "@tsuki/api/types";

import { Badge } from "@/components/ui/badge";

import {
  formatCountry,
  formatExternalLinks,
  formatFuzzyDate,
  formatMediaSource,
  mediaDescriptionText,
  unitCount,
} from "../media";
import { MediaActions } from "./media-actions";
import { MediaTrailer } from "./media-trailer";

export function MediaDetails({ media }: { media: Media }) {
  const detailItems = getDetailItems(media);
  const links = getMediaLinks(media);
  const synopsis = mediaDescriptionText(media.description);

  return (
    <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      <div className="space-y-8">
        <MediaActions mediaType={media.type} mediaId={media.id} total={unitCount(media)} />

        {media.genres && media.genres.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {media.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="font-normal">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Details
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:grid-cols-1">
            {detailItems.map((item) => (
              <InfoItem key={item.label} label={item.label} value={item.value} />
            ))}
          </dl>
        </div>

        {links.items.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              {links.heading}
            </h3>
            <div className="flex flex-col gap-2">
              {links.items.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.icon ? (
                    <img
                      src={link.icon}
                      alt={link.site}
                      width={16}
                      height={16}
                      className="size-4 rounded-sm bg-primary object-contain p-0.5 dark:bg-transparent dark:p-0"
                    />
                  ) : null}
                  <span className="group-hover:underline group-hover:decoration-dashed group-hover:underline-offset-4">
                    {link.label}
                  </span>
                  <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="min-w-0 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Synopsis</h2>
        <p className="prose prose-sm max-w-none whitespace-pre-line leading-relaxed text-muted-foreground dark:prose-invert md:prose-base">
          {synopsis}
        </p>

        {media.trailer && media.trailer.site === "youtube" ? (
          <MediaTrailer trailerId={media.trailer.id} />
        ) : null}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function getDetailItems(media: Media) {
  const typeSpecificItems =
    media.type === "ANIME"
      ? [
          { label: "Episodes", value: media.episodes },
          { label: "Duration", value: media.duration ? `${media.duration} mins` : null },
        ]
      : [
          { label: "Chapters", value: media.chapters },
          { label: "Volumes", value: media.volumes },
        ];

  return [
    ...typeSpecificItems,
    { label: "Start date", value: formatFuzzyDate(media.startDate) },
    { label: "End date", value: formatFuzzyDate(media.endDate) },
    { label: "Source", value: media.source ? formatMediaSource(media.source) : null },
    { label: "Country", value: formatCountry(media.countryOfOrigin) },
    {
      label: "AniList popularity",
      value: media.popularity?.toLocaleString("en-US"),
    },
    {
      label: "AniList favourites",
      value: media.favourites?.toLocaleString("en-US"),
    },
  ];
}

function getMediaLinks(media: Media) {
  return {
    heading: media.type === "ANIME" ? "Where to Watch" : "Where to Read",
    items: formatExternalLinks(
      media.type === "ANIME"
        ? (media.externalLinks?.filter((link) => link.type === "STREAMING") ?? [])
        : (media.externalLinks ?? []),
    ),
  };
}
