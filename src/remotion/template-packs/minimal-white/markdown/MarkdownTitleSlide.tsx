// minimal-white / Markdown / MarkdownTitleSlide
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props { heading: string; subtitle?: string; tags?: string[]; }

const ACCENT = "#3b82f6";

export const MarkdownTitleSlide: React.FC<Props> = ({ heading, subtitle, tags }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 20], [25, 0], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [10, 28], [0, 100], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#fafafa", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 120px" }}>
      <h1 style={{ fontSize: 64, fontWeight: 800, color: "#1a1a1a", lineHeight: 1.2, margin: 0, opacity: o, transform: `translateY(${y}px)`, fontFamily: "'Noto Serif SC', serif", maxWidth: 1100 }}>
        {heading}
      </h1>
      <div style={{ width: lineW, height: 4, background: ACCENT, borderRadius: 2, marginTop: 28, marginBottom: 20 }} />
      {subtitle && (
        <p style={{ fontSize: 28, color: "#666", margin: 0, fontFamily: "'Inter', sans-serif", opacity: interpolate(frame, [12, 28], [0, 1], { extrapolateRight: "clamp" }), maxWidth: 700 }}>
          {subtitle}
        </p>
      )}
      {tags && tags.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginTop: 28, opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }) }}>
          {tags.map((tag, i) => (
            <span key={i} style={{ padding: "5px 14px", background: `${ACCENT}10`, border: `1px solid ${ACCENT}20`, borderRadius: 16, fontSize: 15, fontWeight: 600, color: ACCENT, fontFamily: "'Inter', sans-serif" }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
