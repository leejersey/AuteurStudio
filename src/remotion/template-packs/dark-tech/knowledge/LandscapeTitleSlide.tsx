import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../../../TemplateThemeContext";

interface Props {
  heading: string;
  subtitle: string;
  tags?: string[];
}

export const LandscapeTitleSlide: React.FC<Props> = ({
  heading,
  subtitle,
  tags,
}) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [40, 0], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
  const tagsOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const lineScale = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 30% 40%, ${theme.colors.primary}25 0%, transparent 60%),
                     radial-gradient(ellipse at 70% 60%, ${theme.colors.tertiary}18 0%, transparent 50%),
                     radial-gradient(circle at 50% 80%, ${theme.colors.secondary}10 0%, transparent 40%),
                     linear-gradient(180deg, ${theme.colors.background} 0%, #060810 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "60px 100px 130px",
      }}
    >
      {/* 装饰光线 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 600,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${theme.colors.primary}40, transparent)`,
          transform: `translate(-50%, -80px) scaleX(${lineScale})`,
        }}
      />

      {/* 标题 */}
      <h1
        style={{
          fontSize: 72,
          fontWeight: 800,
          fontFamily: theme.typography.headingFont,
          color: theme.colors.text,
          textAlign: "center",
          lineHeight: 1.3,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          margin: 0,
          maxWidth: 1000,
        }}
      >
        {heading}
      </h1>

      {/* 副标题 */}
      <p
        style={{
          fontSize: 32,
          fontWeight: 400,
          fontFamily: theme.typography.bodyFont,
          color: `${theme.colors.textMuted}`,
          textAlign: "center",
          opacity: subtitleOpacity,
          marginTop: 24,
          maxWidth: 700,
        }}
      >
        {subtitle}
      </p>

      {/* 标签 */}
      {tags && tags.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 36,
            opacity: tagsOpacity,
          }}
        >
          {tags.map((tag, i) => (
            <span
              key={i}
              style={{
                padding: "6px 18px",
                background: `${theme.colors.primary}18`,
                border: `1px solid ${theme.colors.primary}35`,
                borderRadius: 20,
                fontSize: 18,
                fontWeight: 600,
                color: theme.colors.primary,
                letterSpacing: 1,
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
