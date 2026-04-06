// minimal-white / Knowledge / LandscapeTitleSlide
import React from "react";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  heading: string;
  subtitle: string;
  tags?: string[];
}


export const LandscapeTitleSlide: React.FC<Props> = ({ heading, subtitle, tags }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [30, 0], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [12, 28], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [8, 25], [0, 100], { extrapolateRight: "clamp" });
  const tagsOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.background,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "80px 120px",
      }}
    >
      <h1 style={{
        fontSize: 68,
        fontWeight: 800,
        color: theme.colors.text,
        lineHeight: 1.2,
        margin: 0,
        opacity: titleOpacity,
        transform: `translateY(${titleY}px)`,
        fontFamily: theme.typography.headingFont,
        maxWidth: 1200,
      }}>
        {heading}
      </h1>

      <div style={{ width: lineW, height: 4, background: theme.colors.primary, borderRadius: 2, marginTop: 32, marginBottom: 24 }} />

      <p style={{
        fontSize: 30,
        fontWeight: 400,
        color: theme.colors.textMuted,
        opacity: subtitleOpacity,
        margin: 0,
        fontFamily: theme.typography.bodyFont,
        maxWidth: 800,
        lineHeight: 1.6,
      }}>
        {subtitle}
      </p>

      {tags && tags.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginTop: 30, opacity: tagsOpacity }}>
          {tags.map((tag, i) => (
            <span key={i} style={{
              padding: "6px 16px",
              background: `${theme.colors.primary}10`,
              border: `1px solid ${theme.colors.primary}25`,
              borderRadius: 20,
              fontSize: 16,
              fontWeight: 600,
              color: theme.colors.primary,
              fontFamily: theme.typography.bodyFont,
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
