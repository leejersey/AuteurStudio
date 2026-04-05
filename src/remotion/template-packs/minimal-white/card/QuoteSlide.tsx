// minimal-white / Card / QuoteSlide — 极简白色引用页
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { QuoteSlide } from "@/lib/types/card-video";

interface Props {
  data: QuoteSlide;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

const ACCENT = "#3b82f6";

export const QuoteSlideComp: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const quoteOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const quoteScale = interpolate(frame, [0, 20], [0.97, 1], { extrapolateRight: "clamp" });
  const barHeight = interpolate(frame, [5, 25], [0, 200], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "100px 80px",
      }}
    >
      {data.heading && (
        <h2
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "#888",
            margin: "0 0 40px",
            fontFamily: "'Inter', sans-serif",
            opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {data.heading}
        </h2>
      )}

      <div style={{ display: "flex", gap: 24, opacity: quoteOpacity, transform: `scale(${quoteScale})` }}>
        {/* 左侧装饰条 */}
        <div
          style={{
            width: 4,
            height: barHeight,
            background: ACCENT,
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <div>
          <p
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: "#333",
              lineHeight: 1.7,
              margin: 0,
              fontFamily: "'Noto Serif SC', serif",
              fontStyle: "italic",
            }}
          >
            "{data.quote}"
          </p>
          {data.source && (
            <p style={{ fontSize: 22, color: "#999", marginTop: 20, fontFamily: "'Inter', sans-serif" }}>
              — {data.source}
            </p>
          )}
        </div>
      </div>

      {data.summary && (
        <p
          style={{
            fontSize: 24,
            color: "#666",
            marginTop: 40,
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.6,
            opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {data.summary}
        </p>
      )}
    </AbsoluteFill>
  );
};
