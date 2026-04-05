// minimal-white / Knowledge / LandscapeEndingSlide
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  heading: string;
  summary: string;
  keyTakeaways?: string[];
  callToAction?: string;
}

const ACCENT = "#3b82f6";

export const LandscapeEndingSlide: React.FC<Props> = ({ heading, summary, keyTakeaways, callToAction }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const takeawaysOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 120px",
        textAlign: "center",
      }}
    >
      <h2 style={{
        fontSize: 52,
        fontWeight: 700,
        color: "#1a1a1a",
        margin: "0 0 20px",
        fontFamily: "'Noto Serif SC', serif",
        opacity,
      }}>
        {heading}
      </h2>

      <p style={{
        fontSize: 26,
        color: "#666",
        margin: "0 0 40px",
        maxWidth: 800,
        lineHeight: 1.6,
        fontFamily: "'Inter', sans-serif",
        opacity,
      }}>
        {summary}
      </p>

      {keyTakeaways && keyTakeaways.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginBottom: 40, opacity: takeawaysOpacity }}>
          {keyTakeaways.map((kt, i) => (
            <div key={i} style={{
              padding: "12px 24px",
              background: "#fff",
              borderRadius: 12,
              border: `1px solid ${ACCENT}20`,
              fontSize: 18,
              fontWeight: 600,
              color: "#444",
              fontFamily: "'Inter', sans-serif",
            }}>
              ✓ {kt}
            </div>
          ))}
        </div>
      )}

      {callToAction && (
        <p style={{
          fontSize: 22,
          color: ACCENT,
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          opacity: takeawaysOpacity,
        }}>
          {callToAction}
        </p>
      )}
    </AbsoluteFill>
  );
};
