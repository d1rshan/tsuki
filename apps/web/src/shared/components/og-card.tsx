import type { OgCardLayout } from "@/shared/lib/og-card";

const SIZE = { width: 1200, height: 630 };
const base = {
  ...SIZE,
  display: "flex",
  position: "relative" as const,
  overflow: "hidden" as const,
  background: "#171717",
  color: "#fafafa",
  fontFamily: "Geist",
};

// sRGB equivalents of the neutral dark theme tokens in globals.css (ImageResponse cannot use CSS variables).
const dark = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  card: "#262626",
  muted: "#171717",
  mutedForeground: "#a1a1a1",
  border: "#0f0f0f",
};

/** ImageResponse renderer for the three shared OG designs. */
export function OgCard({ layout }: { layout: OgCardLayout }) {
  if (layout.variant === "minimal") {
    return (
      <div style={{ ...base, background: dark.background, color: dark.foreground }}>
        <div
          style={{
            position: "absolute",
            right: -90,
            top: -150,
            width: 740,
            height: 740,
            borderRadius: 370,
            border: `1px solid ${dark.card}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 14,
            top: -46,
            width: 532,
            height: 532,
            borderRadius: 266,
            background: dark.muted,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 174,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 148,
              fontWeight: 700,
              letterSpacing: "-0.075em",
              lineHeight: 1,
            }}
          >
            {layout.title}
          </div>
          {layout.description ? (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                color: dark.mutedForeground,
                maxWidth: 580,
              }}
            >
              {layout.description}
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: "absolute",
            left: 84,
            bottom: 53,
            display: "flex",
            color: dark.mutedForeground,
            fontSize: 23,
          }}
        >
          tsuki.fun
        </div>
      </div>
    );
  }

  if (layout.variant === "profile") {
    return (
      <div style={{ ...base, background: dark.background, color: dark.foreground }}>
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            top: 150,
            height: 330,
            display: "flex",
            padding: 14,
            gap: 14,
            borderRadius: 24,
            background: dark.muted,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 230,
              flexShrink: 0,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 130,
                height: 130,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 65,
                overflow: "hidden",
                background: dark.card,
                color: dark.mutedForeground,
                fontSize: 50,
                fontWeight: 700,
              }}
            >
              {layout.avatarUrl ? (
                <img
                  src={layout.avatarUrl}
                  width={130}
                  height={130}
                  alt=""
                  style={{ objectFit: "cover" }}
                />
              ) : (
                layout.title.charAt(0).toUpperCase()
              )}
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 210,
                fontSize: 25,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineClamp: 1,
              }}
            >
              {layout.title}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              position: "relative",
              flex: 1,
              overflow: "hidden",
              borderRadius: 16,
              background: dark.card,
            }}
          >
            {layout.bannerUrl ? (
              <img
                src={layout.bannerUrl}
                width={800}
                height={302}
                alt=""
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  position: "absolute",
                  right: -55,
                  top: -100,
                  width: 500,
                  height: 500,
                  borderRadius: 250,
                  background: dark.card,
                }}
              />
            )}
            {layout.description && layout.bannerUrl ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  backgroundImage: "linear-gradient(to top, rgba(23,23,23,0.85), transparent 70%)",
                }}
              />
            ) : null}
            {layout.description ? (
              <div
                style={{
                  position: "absolute",
                  left: 32,
                  right: 32,
                  bottom: 30,
                  display: "flex",
                  color: "#fafafa",
                  fontSize: 26,
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineClamp: 3,
                  textShadow: "0 2px 12px #171717",
                }}
              >
                {layout.description}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={base}>
      {layout.variant === "banner" ? (
        <img
          src={layout.bannerUrl}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            objectFit: "cover",
            ...(layout.kicker === "Manga" ? { filter: "grayscale(100%)" } : {}),
            opacity: layout.kicker === "Manga" ? 0.9 : 1,
          }}
        />
      ) : layout.coverUrl ? (
        <img
          src={layout.coverUrl}
          alt=""
          width={1320}
          height={750}
          style={{
            position: "absolute",
            top: -60,
            left: -60,
            objectFit: "cover",
            filter: layout.kicker === "Manga" ? "blur(24px) grayscale(100%)" : "blur(24px)",
            opacity: layout.kicker === "Manga" ? 0.9 : 1,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          display: "flex",
          backgroundImage:
            "linear-gradient(to bottom, rgba(23,23,23,0.12) 0%, rgba(23,23,23,0.42) 40%, rgba(23,23,23,0.92) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 78,
          display: "flex",
          alignItems: "flex-end",
          gap: 36,
        }}
      >
        <div
          style={{
            width: 210,
            height: 280,
            flexShrink: 0,
            display: "flex",
            overflow: "hidden",
            borderRadius: 12,
            background: "#333333",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {layout.coverUrl ? (
            <img
              src={layout.coverUrl}
              alt=""
              width={210}
              height={280}
              style={{
                objectFit: "cover",
                ...(layout.kicker === "Manga" ? { filter: "grayscale(100%)" } : {}),
                opacity: layout.kicker === "Manga" ? 0.9 : 1,
              }}
            />
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
            paddingBottom: 4,
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineClamp: 3,
            }}
          >
            {layout.title}
          </div>
          {layout.titleNative ? (
            <div
              style={{
                display: "flex",
                color: "#b5b5b5",
                fontFamily: "Noto Sans JP",
                fontSize: 26,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineClamp: 1,
              }}
            >
              {layout.titleNative}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
