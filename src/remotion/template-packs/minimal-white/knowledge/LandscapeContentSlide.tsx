// minimal-white / Knowledge / LandscapeContentSlide
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  heading: string;
  points: { icon?: string; text: string; detail?: string }[];
}

const ACCENT = "#3b82f6";

export const LandscapeContentSlide: React.FC<Props> = ({ heading, points }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        padding: "70px 120px",
      }}
    >
      <h2 style={{
        fontSize: 48,
        fontWeight: 700,
        color: "#1a1a1a",
        margin: "0 0 50px",
        fontFamily: "'Noto Serif SC', serif",
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        {heading}
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, flex: 1 }}>
        {points.map((point, i) => {
          const delay = 8 + i * 7;
          const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" });
          const slideY = interpolate(frame, [delay, delay + 15], [15, 0], { extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                flex: "1 1 calc(50% - 12px)",
                minWidth: 350,
                padding: "28px 32px",
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                opacity,
                transform: `translateY(${slideY}px)`,
              }}
            >
              {point.icon && (
                <span style={{ fontSize: 32, marginBottom: 12, display: "block" }}>{point.icon}</span>
              )}
              <p style={{ fontSize: 24, fontWeight: 600, color: "#1a1a1a", margin: 0, lineHeight: 1.4, fontFamily: "'Inter', sans-serif" }}>
                {point.text}
              </p>
              {point.detail && (
                <p style={{ fontSize: 18, color: "#888", margin: "8px 0 0", lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                  {point.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
