// minimal-white / Markdown / MarkdownContentSlide
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props { heading: string; points: { text: string; detail?: string }[]; }

const ACCENT = "#3b82f6";

export const MarkdownContentSlide: React.FC<Props> = ({ heading, points }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#fafafa", display: "flex", flexDirection: "column", padding: "70px 120px" }}>
      <h2 style={{ fontSize: 44, fontWeight: 700, color: "#1a1a1a", margin: "0 0 40px", fontFamily: "'Noto Serif SC', serif", opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) }}>
        {heading}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {points.map((p, i) => {
          const delay = 8 + i * 6;
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", opacity, padding: "16px 24px", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT, flexShrink: 0, marginTop: 10 }} />
              <div>
                <p style={{ fontSize: 24, fontWeight: 600, color: "#1a1a1a", margin: 0, fontFamily: "'Inter', sans-serif" }}>{p.text}</p>
                {p.detail && <p style={{ fontSize: 18, color: "#888", margin: "6px 0 0", fontFamily: "'Inter', sans-serif" }}>{p.detail}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
