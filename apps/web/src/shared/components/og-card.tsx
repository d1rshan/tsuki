import type { OgCardLayout } from "@/shared/lib/og-card";

const SIZE = { width: 1200, height: 630 };

const OVERLAY =
  "linear-gradient(to top, rgba(10,10,10,0.95) 20%, rgba(10,10,10,0.35) 70%, rgba(10,10,10,0.15))";

function Wordmark() {
  return (
    <div
      style={{
        display: "flex",
        color: "white",
        fontSize: 36,
        fontWeight: 700,
        letterSpacing: "-0.02em",
      }}
    >
      Tsuki
    </div>
  );
}

function MediaTitle({
  layout,
}: {
  layout: Extract<OgCardLayout, { variant: "banner" | "fallback" }>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          color: "rgba(255,255,255,0.75)",
          fontSize: 30,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {layout.kicker}
      </div>
      <div
        style={{ display: "flex", color: "white", fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}
      >
        {layout.title}
      </div>
    </div>
  );
}

function CoverThumb({ url }: { url: string | null }) {
  if (!url) return null;

  return (
    <img
      src={url}
      alt=""
      width={190}
      height={280}
      style={{ borderRadius: 14, objectFit: "cover" }}
    />
  );
}

/** Satori JSX for OG cards. Layout decisions live in @/shared/lib/og-card; this only renders. */
export function OgCard({ layout }: { layout: OgCardLayout }) {
  if (layout.variant === "minimal") {
    return (
      <div
        style={{
          ...SIZE,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#0a0a0a",
        }}
      >
        <Wordmark />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", color: "white", fontSize: 96, fontWeight: 700 }}>
            {layout.title}
          </div>
          {layout.description ? (
            <div style={{ display: "flex", color: "rgba(255,255,255,0.65)", fontSize: 36 }}>
              {layout.description}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", color: "rgba(255,255,255,0.4)", fontSize: 28 }}>
          tsuki.fun
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...SIZE,
        display: "flex",
        position: "relative",
        color: "white",
      }}
    >
      {layout.variant === "banner" ? (
        <img
          src={layout.bannerUrl}
          alt={layout.title}
          width={SIZE.width}
          height={SIZE.height}
          style={{ position: "absolute", inset: 0, objectFit: "cover" }}
        />
      ) : layout.coverUrl ? (
        // ponytail: satori's blur support is the bet here; if a render limitation
        // appears, degrade to a darker solid overlay rather than dropping the fallback.
        <img
          src={layout.coverUrl}
          alt=""
          width={SIZE.width}
          height={SIZE.height}
          style={{
            position: "absolute",
            inset: 0,
            objectFit: "cover",
            transform: "scale(1.2)",
            filter: "blur(48px)",
          }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "#0a0a0a" }} />
      )}
      <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: OVERLAY }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
        }}
      >
        <Wordmark />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 32 }}>
          <CoverThumb url={layout.coverUrl} />
          <MediaTitle layout={layout} />
        </div>
      </div>
    </div>
  );
}
