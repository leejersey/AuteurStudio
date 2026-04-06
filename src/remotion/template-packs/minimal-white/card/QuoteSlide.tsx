// minimal-white / Card / QuoteSlide — 极简白色引用页
import React from "react";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { QuoteSlide } from "@/lib/types/card-video";

interface Props {
  data: QuoteSlide;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}


export const QuoteSlideComp: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const quoteOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const quoteScale = interpolate(frame, [0, 20], [0.97, 1], { extrapolateRight: "clamp" });
  const barHeight = interpolate(frame, [5, 25], [0, 200], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.background,
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
            color: theme.colors.textMuted,
            margin: "0 0 40px",
            fontFamily: theme.typography.bodyFont,
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
            background: theme.colors.primary,
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
              fontFamily: theme.typography.headingFont,
              fontStyle: "italic",
            }}
          >
            "{data.quote}"
          </p>
          {data.source && (
            <p style={{ fontSize: 22, color: "#999", marginTop: 20, fontFamily: theme.typography.bodyFont }}>
              — {data.source}
            </p>
          )}
        </div>
      </div>

      {data.summary && (
        <p
          style={{
            fontSize: 24,
            color: theme.colors.textMuted,
            marginTop: 40,
            fontFamily: theme.typography.bodyFont,
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
