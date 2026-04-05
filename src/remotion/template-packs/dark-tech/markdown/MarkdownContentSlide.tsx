// Markdown 内容页 Slide — 要点列表渐入
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../../../styles/theme";

interface Props {
  heading: string;
  points: { text: string; detail?: string }[];
}

export const MarkdownContentSlide: React.FC<Props> = ({ heading, points }) => {
  const frame = useCurrentFrame();

  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const headingX = interpolate(frame, [0, 15], [-30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.background,
        fontFamily: FONTS.body,
        padding: "80px 100px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 标题 */}
      <h2
        style={{
          fontSize: 48,
          fontWeight: 700,
          fontFamily: FONTS.headline,
          color: COLORS.onSurface,
          marginBottom: 50,
          opacity: headingOpacity,
          transform: `translateX(${headingX}px)`,
          borderLeft: `4px solid ${COLORS.primary}`,
          paddingLeft: 24,
        }}
      >
        {heading}
      </h2>

      {/* 要点列表 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
        {points.map((point, i) => {
          const delay = 15 + i * 8;
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
          const x = interpolate(frame, [delay, delay + 12], [40, 0], { extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateX(${x}px)`,
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                padding: "16px 20px",
                background: `${COLORS.surface}80`,
                borderRadius: 12,
                borderLeft: `3px solid ${COLORS.primary}40`,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: COLORS.primary,
                  minWidth: 30,
                  fontFamily: FONTS.mono,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p
                  style={{
                    fontSize: 24,
                    color: COLORS.onSurface,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {point.text}
                </p>
                {point.detail && (
                  <p
                    style={{
                      fontSize: 18,
                      color: COLORS.onSurfaceVariant,
                      marginTop: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    {point.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
