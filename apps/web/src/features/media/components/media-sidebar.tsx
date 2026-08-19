import { ExternalLink } from "@/shared/components/external-link";
import { Badge } from "@/shared/components/ui/badge";

import type { NormalizedMedia } from "../media";
import { MediaActions } from "./media-actions";

type MediaSidebarProps = Pick<
  NormalizedMedia,
  "count" | "details" | "genres" | "id" | "links" | "type"
>;

export function MediaSidebar({ count, details, genres, id, links, type }: MediaSidebarProps) {
  return (
    <aside className="flex flex-col gap-8">
      <MediaActions mediaType={type} mediaId={id} total={count} />

      {genres.length > 0 && (
        <MediaSidebarSection title="Genres">
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        </MediaSidebarSection>
      )}

      <MediaSidebarSection title="Details">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:grid-cols-1">
          {details.map((item) => (
            <InfoItem key={item.label} label={item.label} value={item.value} />
          ))}
        </dl>
      </MediaSidebarSection>

      {links.items.length > 0 && (
        <MediaSidebarSection title={links.heading}>
          <div className="flex flex-col items-start gap-2">
            {links.items.map((link) => (
              <ExternalLink key={link.url} href={link.url}>
                {link.label}
              </ExternalLink>
            ))}
          </div>
        </MediaSidebarSection>
      )}
    </aside>
  );
}

function MediaSidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
