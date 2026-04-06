import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../../../TemplateThemeContext";

interface Props {
  heading: string;
  summary: string;
  keyTakeaways?: string[];
  callToAction?: string;
}

export const LandscapeEndingSlide: React.FC<Props> = ({
  heading,
  summary,
  keyTakeaways,
  callToAction,
}) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const summaryOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });
  const takeawaysOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, ${theme.colors.primary}10 0%, transparent 60%),
                     linear-gradient(180deg, ${theme.colors.background} 0%, #060810 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "50px 100px 130px",
        gap: 24,
      }}
    >
      {/* 标题 */}
      <h2
        style={{
          fontSize: 52,
          fontWeight: 800,
          fontFamily: theme.typography.headingFont,
          color: theme.colors.text,
          textAlign: "center",
          opacity: headingOpacity,
          margin: 0,
        }}
      >
        {heading}
      </h2>

      {/* 总结 */}
      <p
        style={{
          fontSize: 28,
          color: theme.colors.textMuted,
          fontFamily: theme.typography.bodyFont,
          textAlign: "center",
          opacity: summaryOpacity,
          maxWidth: 700,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {summary}
      </p>

      {/* 关键要点 */}
      {keyTakeaways && keyTakeaways.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
            opacity: takeawaysOpacity,
            marginTop: 10,
          }}
        >
          {keyTakeaways.map((item, i) => (
            <div
              key={i}
              style={{
                padding: "10px 20px",
                background: `${theme.colors.primary}12`,
                border: `1px solid ${theme.colors.primary}25`,
                borderRadius: 12,
                fontSize: 22,
                color: theme.colors.text,
                fontFamily: theme.typography.bodyFont,
                fontWeight: 500,
              }}
            >
              ✅ {item}
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      {callToAction && (
        <p
          style={{
            fontSize: 24,
            color: theme.colors.primary,
            fontWeight: 600,
            opacity: ctaOpacity,
            marginTop: 20,
          }}
        >
          {callToAction}
        </p>
      )}
    </AbsoluteFill>
  );
};
