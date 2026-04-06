import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideImage } from "../shared/SlideImage";
import { COLORS, FONTS } from "../styles/theme";

interface Point {
  icon?: string;
  text: string;
  detail?: string;
}

interface Props {
  heading: string;
  points: Point[];
  imageUrl?: string;
  imageCredit?: string;
}

export const LandscapeContentSlide: React.FC<Props> = ({
  heading,
  points,
  imageUrl,
  imageCredit,
}) => {
  const frame = useCurrentFrame();
  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // 安全限制：最多展示 4 个 point
  const safePoints = points.slice(0, 4);
  const fontSize = safePoints.length <= 2 ? 26 : 22;

  const mainContent = (
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
          overflow: "hidden",
        }}
      >
        {safePoints.map((point, i) => {
          const delay = i * 8;
          const opacity = interpolate(frame, [10 + delay, 25 + delay], [0, 1], { extrapolateRight: "clamp" });
          const x = interpolate(frame, [10 + delay, 25 + delay], [30, 0], { extrapolateRight: "clamp" });

          const displayText = point.text.length > 55
            ? point.text.slice(0, 55) + "…"
            : point.text;

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
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {point.icon && (
                <span style={{ fontSize: 36, flexShrink: 0 }}>{point.icon}</span>
              )}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p
                  style={{
                    fontSize,
                    fontWeight: 600,
                    color: COLORS.onSurface,
                    margin: 0,
                    fontFamily: FONTS.body,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                  }}
                >
                  {displayText}
                </p>
                {point.detail && (
                  <p
                    style={{
                      fontSize: 18,
                      color: COLORS.onSurfaceVariant,
                      margin: "6px 0 0",
                      fontFamily: FONTS.body,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical" as const,
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

  if (imageUrl) {
    return (
      <AbsoluteFill>
        <SlideImage
          src={imageUrl}
          layout="side"
          sidePosition="right"
          sideRatio={0.38}
          credit={imageCredit}
        >
          {mainContent}
        </SlideImage>
      </AbsoluteFill>
    );
  }

  return mainContent;
};


