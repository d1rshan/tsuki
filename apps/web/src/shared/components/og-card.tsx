import type { OgCardLayout } from "@/shared/lib/og-card";

const SIZE = { width: 1200, height: 630 };

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
          <div
            style={{
              display: "flex",
              color: "white",
              fontSize: 96,
              fontWeight: 700,
            }}
          >
            {layout.title}
          </div>
          {layout.description ? (
            <div
              style={{
                display: "flex",
                color: "rgba(255,255,255,0.65)",
                fontSize: 36,
              }}
            >
              {layout.description}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            color: "rgba(255,255,255,0.4)",
            fontSize: 28,
          }}
        >
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
        overflow: "hidden",
        background: "#171717",
        color: "#fafafa",
        fontFamily: "Geist",
      }}
    >
      {layout.variant === "banner" ? (
        <img
          src={layout.bannerUrl}
          alt=""
          width={1200}
          height={400}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
      ) : layout.coverUrl ? (
        <img
          src={layout.coverUrl}
          alt=""
          width={1200}
          height={400}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            objectFit: "cover",
            filter: "blur(30px)",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 410,
          display: "flex",
          backgroundImage:
            "linear-gradient(to bottom, rgba(23,23,23,0.08) 0%, rgba(23,23,23,0.35) 45%, #171717 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 64,
          display: "flex",
          alignItems: "flex-end",
          gap: 36,
        }}
      >
        <div
          style={{
            width: 222,
            height: 296,
            flexShrink: 0,
            display: "flex",
            overflow: "hidden",
            borderRadius: 12,
            background: "#333333",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {layout.coverUrl ? (
            <img
              src={layout.coverUrl}
              alt=""
              width={222}
              height={296}
              style={{ objectFit: "cover" }}
            />
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
            paddingBottom: 8,
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#fafafa",
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineClamp: 3,
            }}
          >
            {layout.title}
          </div>
        </div>
      </div>
    </div>
  );
}
