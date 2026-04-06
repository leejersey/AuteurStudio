// Markdown 结尾页 Slide
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../../../TemplateThemeContext";

interface Props {
  heading: string;
  summary?: string;
  callToAction?: string;
}

export const MarkdownEndingSlide: React.FC<Props> = ({ heading, summary, callToAction }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, 20], [0.9, 1], { extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, ${theme.colors.surfaceHigh}, ${theme.colors.background})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.typography.bodyFont,
        padding: 100,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* 图标 */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${theme.colors.primary}30, ${theme.colors.secondary}30)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
          fontSize: 40,
        }}
      >
        ✅
      </div>

      <h2
        style={{
          fontSize: 56,
          fontWeight: 800,
          fontFamily: theme.typography.headingFont,
          color: theme.colors.text,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        {heading}
      </h2>

      {summary && (
        <p
          style={{
            fontSize: 24,
            color: theme.colors.textMuted,
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.6,
            marginBottom: 40,
          }}
        >
          {summary}
        </p>
      )}

      {callToAction && (
        <div
          style={{
            opacity: ctaOpacity,
            padding: "16px 40px",
            background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`,
            border: `1px solid ${theme.colors.primary}40`,
            borderRadius: 30,
            fontSize: 22,
            fontWeight: 700,
            color: theme.colors.primary,
          }}
        >
          {callToAction}
        </div>
      )}
    </AbsoluteFill>
  );
};
