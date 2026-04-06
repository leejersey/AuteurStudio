// minimal-white / Knowledge / LandscapeEndingSlide
import React from "react";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  heading: string;
  summary: string;
  keyTakeaways?: string[];
  callToAction?: string;
}


export const LandscapeEndingSlide: React.FC<Props> = ({ heading, summary, keyTakeaways, callToAction }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const takeawaysOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.background,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 120px",
        textAlign: "center",
      }}
    >
      <h2 style={{
        fontSize: 52,
        fontWeight: 700,
        color: theme.colors.text,
        margin: "0 0 20px",
        fontFamily: theme.typography.headingFont,
        opacity,
      }}>
        {heading}
      </h2>

      <p style={{
        fontSize: 26,
        color: theme.colors.textMuted,
        margin: "0 0 40px",
        maxWidth: 800,
        lineHeight: 1.6,
        fontFamily: theme.typography.bodyFont,
        opacity,
      }}>
        {summary}
      </p>

      {keyTakeaways && keyTakeaways.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginBottom: 40, opacity: takeawaysOpacity }}>
          {keyTakeaways.map((kt, i) => (
            <div key={i} style={{
              padding: "12px 24px",
              background: "#fff",
              borderRadius: 12,
              border: `1px solid ${theme.colors.primary}20`,
              fontSize: 18,
              fontWeight: 600,
              color: "#444",
              fontFamily: theme.typography.bodyFont,
            }}>
              ✓ {kt}
            </div>
          ))}
        </div>
      )}

      {callToAction && (
        <p style={{
          fontSize: 22,
          color: theme.colors.primary,
          fontWeight: 600,
          fontFamily: theme.typography.bodyFont,
          opacity: takeawaysOpacity,
        }}>
          {callToAction}
        </p>
      )}
    </AbsoluteFill>
  );
};
