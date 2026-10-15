import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const ogSize = { width: 1200, height: 630 };

const C = {
  bg: "#0d0e12",
  surface: "#16181e",
  line: "#2a2d37",
  ink: "#ece9e1",
  muted: "#979aa3",
  accent: "#fb923c",
  phosphor: "#4ade80",
};

/** Shared Open Graph card: dark CRT panel with a pixel logo, a kicker, a title and a footer line. */
export function ogImage({ kicker, title, footer }: { kicker: string; title: string; footer: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: C.bg,
          padding: 56,
          color: C.ink,
          fontFamily: "sans-serif",
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", width: 56, height: 56, background: C.ink, padding: 4, flexDirection: "column" }}>
            <div style={{ display: "flex", flex: 1, background: C.accent }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, height: 10 }}>
              <div style={{ width: 10, background: C.bg }} />
              <div style={{ width: 10, background: C.bg }} />
              <div style={{ width: 10, background: C.phosphor }} />
            </div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 2 }}>{site.name}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            marginTop: 24,
            border: `2px solid ${C.line}`,
            background: C.surface,
            padding: "40px 48px",
            boxShadow: `10px 10px 0 0 ${C.line}`,
          }}
        >
          <div style={{ fontSize: 26, color: C.accent, textTransform: "uppercase", letterSpacing: 6 }}>{kicker}</div>
          <div style={{ fontSize: title.length > 40 ? 58 : 72, fontWeight: 800, lineHeight: 1.05, marginTop: 18 }}>{title}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, fontSize: 24, color: C.muted }}>
          <span>{footer}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 12, color: C.phosphor }}>
            <span style={{ width: 14, height: 14, background: C.phosphor }} />
            portvault
          </span>
        </div>
      </div>
    ),
    ogSize,
  );
}
