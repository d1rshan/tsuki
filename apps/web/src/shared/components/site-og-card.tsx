export function SiteOgCard({ artwork }: { artwork: string[] }) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          width: 1200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 112,
            fontWeight: 700,
            letterSpacing: "-0.075em",
            lineHeight: 1,
          }}
        >
          <span
            style={{ fontFamily: "Noto Sans JP", fontSize: 78, fontWeight: 700, letterSpacing: 0 }}
          >
            月
          </span>
          <span>tsuki</span>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#a1a1a1" }}>
          Track, rate, and review anime and manga.
        </div>
      </div>
      {artwork.map((src, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: 315 + Math.abs(index - 5) * 10,
            left: -100 + index * 120,
            width: 220,
            height: 330,
            display: "flex",
            overflow: "hidden",
            borderRadius: 12,
            background: "#262626",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            transform: `rotate(${(index - 5) * 2.5}deg)`,
          }}
        >
          <img src={src} alt="" width={220} height={330} style={{ objectFit: "cover" }} />
        </div>
      ))}
    </div>
  );
}
