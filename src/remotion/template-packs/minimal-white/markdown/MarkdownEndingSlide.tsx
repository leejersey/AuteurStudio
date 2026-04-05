// minimal-white / Markdown / MarkdownEndingSlide
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props { heading: string; summary?: string; callToAction?: string; }

const ACCENT = "#3b82f6";

export const MarkdownEndingSlide: React.FC<Props> = ({ heading, summary, callToAction }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#fafafa", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "80px 120px", textAlign: "center" }}>
      <div style={{ width: 50, height: 2, background: "#ddd", marginBottom: 30, opacity: o }} />
      <h2 style={{ fontSize: 48, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px", fontFamily: "'Noto Serif SC', serif", opacity: o }}>
        {heading}
      </h2>
      {summary && <p style={{ fontSize: 24, color: "#666", margin: "0 0 30px", maxWidth: 700, lineHeight: 1.6, fontFamily: "'Inter', sans-serif", opacity: o }}>{summary}</p>}
      {callToAction && (
        <p style={{ fontSize: 20, color: ACCENT, fontWeight: 600, fontFamily: "'Inter', sans-serif", opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" }) }}>
          {callToAction}
        </p>
      )}
    </AbsoluteFill>
  );
};
