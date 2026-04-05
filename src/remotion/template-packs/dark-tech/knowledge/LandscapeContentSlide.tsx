import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../../../styles/theme";

interface Point {
  icon?: string;
  text: string;
  detail?: string;
}

interface Props {
  heading: string;
  points: Point[];
}

export const LandscapeContentSlide: React.FC<Props> = ({
  heading,
  points,
}) => {
  const frame = useCurrentFrame();
  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.background} 0%, #060810 100%)`,
        display: "flex",
        padding: "40px 80px 130px",
        gap: 60,
      }}
    >
      {/* 左侧标题区 */}
      <div
        style={{
          flex: "0 0 320px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          paddingTop: 40,
          opacity: headingOpacity,
        }}
      >
        <div
          style={{
            width: 4,
            height: 40,
            background: `linear-gradient(180deg, ${COLORS.primary}, ${COLORS.tertiary})`,
            borderRadius: 2,
            marginBottom: 20,
          }}
        />
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily: FONTS.headline,
            color: COLORS.onSurface,
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {heading}
        </h2>
      </div>

      {/* 右侧要点列表 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          paddingTop: 40,
          gap: 16,
        }}
      >
        {points.map((point, i) => {
          const delay = i * 8;
          const opacity = interpolate(frame, [10 + delay, 25 + delay], [0, 1], { extrapolateRight: "clamp" });
          const x = interpolate(frame, [10 + delay, 25 + delay], [30, 0], { extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                padding: "16px 24px",
                background: `${COLORS.surfaceContainer}80`,
                borderRadius: 16,
                border: `1px solid ${COLORS.outlineVariant}25`,
                opacity,
                transform: `translateX(${x}px)`,
              }}
            >
              {point.icon && (
                <span style={{ fontSize: 36, flexShrink: 0 }}>{point.icon}</span>
              )}
              <div>
                <p
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    color: COLORS.onSurface,
                    margin: 0,
                    fontFamily: FONTS.body,
                  }}
                >
                  {point.text}
                </p>
                {point.detail && (
                  <p
                    style={{
                      fontSize: 19,
                      color: COLORS.onSurfaceVariant,
                      margin: "6px 0 0",
                      fontFamily: FONTS.body,
                    }}
                  >
                    {point.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
