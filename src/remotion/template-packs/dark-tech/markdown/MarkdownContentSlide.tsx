// Markdown 内容页 Slide — 要点列表渐入
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../../../TemplateThemeContext";

interface Props {
  heading: string;
  points: { text: string; detail?: string }[];
}

export const MarkdownContentSlide: React.FC<Props> = ({ heading, points }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();

  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const headingX = interpolate(frame, [0, 15], [-30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
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
          fontFamily: theme.typography.headingFont,
          color: theme.colors.text,
          marginBottom: 50,
          opacity: headingOpacity,
          transform: `translateX(${headingX}px)`,
          borderLeft: `4px solid ${theme.colors.primary}`,
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
                background: `${theme.colors.surface}80`,
                borderRadius: 12,
                borderLeft: `3px solid ${theme.colors.primary}40`,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: theme.colors.primary,
                  minWidth: 30,
                  fontFamily: theme.typography.monoFont,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p
                  style={{
                    fontSize: 24,
                    color: theme.colors.text,
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
                      color: theme.colors.textMuted,
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
