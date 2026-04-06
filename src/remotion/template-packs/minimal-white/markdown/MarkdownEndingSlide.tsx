// minimal-white / Markdown / MarkdownEndingSlide
import React from "react";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props { heading: string; summary?: string; callToAction?: string; }


export const MarkdownEndingSlide: React.FC<Props> = ({ heading, summary, callToAction }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const o = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.colors.background, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "80px 120px", textAlign: "center" }}>
      <div style={{ width: 50, height: 2, background: "#ddd", marginBottom: 30, opacity: o }} />
      <h2 style={{ fontSize: 48, fontWeight: 700, color: theme.colors.text, margin: "0 0 16px", fontFamily: theme.typography.headingFont, opacity: o }}>
        {heading}
      </h2>
      {summary && <p style={{ fontSize: 24, color: theme.colors.textMuted, margin: "0 0 30px", maxWidth: 700, lineHeight: 1.6, fontFamily: theme.typography.bodyFont, opacity: o }}>{summary}</p>}
      {callToAction && (
        <p style={{ fontSize: 20, color: theme.colors.primary, fontWeight: 600, fontFamily: theme.typography.bodyFont, opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" }) }}>
          {callToAction}
        </p>
      )}
    </AbsoluteFill>
  );
};
