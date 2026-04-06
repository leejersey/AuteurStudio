// minimal-white / Markdown / MarkdownTitleSlide
import React from "react";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props { heading: string; subtitle?: string; tags?: string[]; }


export const MarkdownTitleSlide: React.FC<Props> = ({ heading, subtitle, tags }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const o = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, 20], [25, 0], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [10, 28], [0, 100], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.colors.background, display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 120px" }}>
      <h1 style={{ fontSize: 64, fontWeight: 800, color: theme.colors.text, lineHeight: 1.2, margin: 0, opacity: o, transform: `translateY(${y}px)`, fontFamily: theme.typography.headingFont, maxWidth: 1100 }}>
        {heading}
      </h1>
      <div style={{ width: lineW, height: 4, background: theme.colors.primary, borderRadius: 2, marginTop: 28, marginBottom: 20 }} />
      {subtitle && (
        <p style={{ fontSize: 28, color: theme.colors.textMuted, margin: 0, fontFamily: theme.typography.bodyFont, opacity: interpolate(frame, [12, 28], [0, 1], { extrapolateRight: "clamp" }), maxWidth: 700 }}>
          {subtitle}
        </p>
      )}
      {tags && tags.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginTop: 28, opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" }) }}>
          {tags.map((tag, i) => (
            <span key={i} style={{ padding: "5px 14px", background: `${theme.colors.primary}10`, border: `1px solid ${theme.colors.primary}20`, borderRadius: 16, fontSize: 15, fontWeight: 600, color: theme.colors.primary, fontFamily: theme.typography.bodyFont }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
