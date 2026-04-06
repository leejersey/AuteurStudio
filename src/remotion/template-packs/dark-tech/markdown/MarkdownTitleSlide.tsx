// Markdown 标题页 Slide
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../../../TemplateThemeContext";

interface Props {
  heading: string;
  subtitle?: string;
  tags?: string[];
}

export const MarkdownTitleSlide: React.FC<Props> = ({ heading, subtitle, tags }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();

  const titleY = interpolate(frame, [0, 20], [40, 0], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });
  const tagOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  const lineWidth = interpolate(frame, [5, 30], [0, 300], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${theme.colors.background} 0%, #0d1117 50%, #161b22 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.typography.bodyFont,
        padding: 80,
      }}
    >
      {/* 装饰性代码背景 */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 80,
          fontSize: 14,
          color: `${theme.colors.primary}15`,
          fontFamily: theme.typography.monoFont,
          whiteSpace: "pre",
          lineHeight: 2,
        }}
      >
        {`import { knowledge } from "markdown";\n\nconst share = async () => {\n  await present(ideas);\n  return impact;\n};`}
      </div>

      {/* 标题 */}
      <h1
        style={{
          fontSize: 72,
          fontWeight: 800,
          fontFamily: theme.typography.headingFont,
          color: theme.colors.text,
          textAlign: "center",
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          lineHeight: 1.2,
          maxWidth: 1200,
        }}
      >
        {heading}
      </h1>

      {/* 分割线 */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          borderRadius: 2,
          margin: "30px 0",
        }}
      />

      {/* 副标题 */}
      {subtitle && (
        <p
          style={{
            fontSize: 28,
            color: theme.colors.textMuted,
            opacity: subtitleOpacity,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* 标签 */}
      {tags && tags.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
            opacity: tagOpacity,
          }}
        >
          {tags.map((tag, i) => (
            <span
              key={i}
              style={{
                padding: "6px 16px",
                background: `${theme.colors.primary}15`,
                border: `1px solid ${theme.colors.primary}30`,
                borderRadius: 20,
                fontSize: 16,
                color: theme.colors.primary,
                fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
