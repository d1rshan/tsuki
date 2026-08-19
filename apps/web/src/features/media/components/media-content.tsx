import type { NormalizedMedia } from "../media";

type MediaContentProps = Pick<NormalizedMedia, "descriptionText" | "trailerUrl">;

export function MediaContent({ descriptionText, trailerUrl }: MediaContentProps) {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <MediaContentSection title="Synopsis">
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
          {descriptionText}
        </p>
      </MediaContentSection>

      {trailerUrl && (
        <MediaContentSection title="Trailer">
          <iframe
            src={trailerUrl}
            title="Trailer"
            className="aspect-video w-full rounded-xl border-0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </MediaContentSection>
      )}
    </div>
  );
}

function MediaContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
