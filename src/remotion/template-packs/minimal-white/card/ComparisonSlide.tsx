// minimal-white / Card / ComparisonSlide — 极简白色对比页
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { ComparisonSlide } from "@/lib/types/card-video";

interface Props {
  data: ComparisonSlide;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

const ACCENT = "#3b82f6";

export const ComparisonSlideComp: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const leftOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });
  const rightOpacity = interpolate(frame, [18, 33], [0, 1], { extrapolateRight: "clamp" });

  const renderSide = (side: ComparisonSlide["left"], isRight: boolean) => (
    <div
      style={{
        flex: 1,
        padding: "32px 28px",
        background: isRight ? `${ACCENT}06` : "#fff",
        borderRadius: 16,
        border: `1px solid ${isRight ? `${ACCENT}20` : "#e5e7eb"}`,
        opacity: isRight ? rightOpacity : leftOpacity,
      }}
    >
      <h3 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a", margin: "0 0 24px", fontFamily: "'Noto Serif SC', serif" }}>
        {side.title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {side.items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: item.positive ? "#22c55e" : "#ef4444",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 22, color: "#444", fontFamily: "'Inter', sans-serif" }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        padding: "80px 60px",
      }}
    >
      <h2 style={{
        fontSize: 44,
        fontWeight: 700,
        color: "#1a1a1a",
        margin: "0 0 40px",
        fontFamily: "'Noto Serif SC', serif",
        opacity: headingOpacity,
      }}>
        {data.heading}
      </h2>

      <div style={{ display: "flex", gap: 20, flex: 1 }}>
        {renderSide(data.left, false)}
        {renderSide(data.right, true)}
      </div>
    </AbsoluteFill>
  );
};
