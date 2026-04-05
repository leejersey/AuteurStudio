import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../../../styles/theme";

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
  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const summaryOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });
  const takeawaysOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, ${COLORS.primary}10 0%, transparent 60%),
                     linear-gradient(180deg, ${COLORS.background} 0%, #060810 100%)`,
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
          fontFamily: FONTS.headline,
          color: COLORS.onSurface,
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
          color: COLORS.onSurfaceVariant,
          fontFamily: FONTS.body,
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
                background: `${COLORS.primary}12`,
                border: `1px solid ${COLORS.primary}25`,
                borderRadius: 12,
                fontSize: 22,
                color: COLORS.onSurface,
                fontFamily: FONTS.body,
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
            color: COLORS.primary,
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
