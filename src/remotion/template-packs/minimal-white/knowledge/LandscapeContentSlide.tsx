// minimal-white / Knowledge / LandscapeContentSlide
// 根本性重写：自适应布局，杜绝内容溢出
import React from "react";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  heading: string;
  points: { icon?: string; text: string; detail?: string }[];
}

export const LandscapeContentSlide: React.FC<Props> = ({ heading, points }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();

  // 安全限制：最多展示 4 个 point
  const safePoints = points.slice(0, 4);

  // 根据 point 数量自适应布局：≤2 用单列，3-4 用两列网格
  const useGrid = safePoints.length > 2;

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.background,
        display: "flex",
        flexDirection: "column",
        padding: "60px 100px 130px",
      }}
    >
      <h2 style={{
        fontSize: 44,
        fontWeight: 700,
        color: theme.colors.text,
        margin: "0 0 36px",
        fontFamily: theme.typography.headingFont,
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
        flexShrink: 0,
      }}>
        {heading}
      </h2>

      <div style={{
        display: "flex",
        flexDirection: useGrid ? "row" : "column",
        flexWrap: useGrid ? "wrap" : "nowrap",
        gap: useGrid ? 20 : 16,
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}>
        {safePoints.map((point, i) => {
          const delay = 8 + i * 7;
          const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" });
          const slideY = interpolate(frame, [delay, delay + 15], [15, 0], { extrapolateRight: "clamp" });

          // 限制单条文本长度（渲染层二次保护）
          const displayText = point.text.length > 55
            ? point.text.slice(0, 55) + "…"
            : point.text;

          return (
            <div
              key={i}
              style={{
                flex: useGrid ? "1 1 calc(50% - 10px)" : "0 0 auto",
                minWidth: useGrid ? "calc(50% - 10px)" : undefined,
                maxWidth: useGrid ? "calc(50% - 10px)" : undefined,
                padding: "24px 28px",
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                opacity,
                transform: `translateY(${slideY}px)`,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {point.icon && (
                <span style={{ fontSize: 28, marginBottom: 10, display: "block", flexShrink: 0 }}>{point.icon}</span>
              )}
              <p style={{
                fontSize: useGrid ? 22 : 24,
                fontWeight: 600,
                color: theme.colors.text,
                margin: 0,
                lineHeight: 1.45,
                fontFamily: theme.typography.bodyFont,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: useGrid ? 2 : 3,
                WebkitBoxOrient: "vertical",
              }}>
                {displayText}
              </p>
              {point.detail && (
                <p style={{
                  fontSize: 17,
                  color: theme.colors.textMuted,
                  margin: "8px 0 0",
                  lineHeight: 1.4,
                  fontFamily: theme.typography.bodyFont,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                }}>
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
