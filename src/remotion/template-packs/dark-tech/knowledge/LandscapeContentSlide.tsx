import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../../../TemplateThemeContext";

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
  const theme = useTemplateTheme();
  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const headingY = interpolate(frame, [0, 15], [-15, 0], { extrapolateRight: "clamp" });
  const lineWidth = interpolate(frame, [5, 25], [0, 80], { extrapolateRight: "clamp" });

  // 安全限制：最多展示 4 个 point
  const safePoints = points.slice(0, 4);
  // 自适应字体大小
  const fontSize = safePoints.length <= 2 ? 23 : 20;

  // 背景图片 Ken Burns
  const bgScale = interpolate(frame, [0, 300], [1.05, 1.15], { extrapolateRight: "clamp" });
  const bgOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  const accentColors = [theme.colors.primary, theme.colors.secondary, theme.colors.tertiary];

  return (
    <AbsoluteFill style={{ background: theme.colors.background }}>
      {/* 层 1：图片氛围背景 */}
      {imageUrl && (
        <AbsoluteFill style={{ opacity: bgOpacity * 0.18, overflow: "hidden" }}>
          <Img
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${bgScale})`,
              filter: "blur(10px) saturate(1.2)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* 层 2：色彩渐变 */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 20% 15%, ${theme.colors.primary}18 0%, transparent 50%),
                       radial-gradient(ellipse at 80% 85%, ${theme.colors.tertiary}10 0%, transparent 45%),
                       linear-gradient(180deg, ${theme.colors.background}f0 0%, ${theme.colors.background} 100%)`,
        }}
      />

      {/* 层 3：上下布局内容 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: "40px 70px 120px",
        }}
      >
        {/* 上方：标题区 */}
        <div
          style={{
            flex: "0 0 auto",
            opacity: headingOpacity,
            transform: `translateY(${headingY}px)`,
            marginBottom: 24,
          }}
        >
          {/* 彩色装饰条 */}
          <div
            style={{
              width: 4,
              height: 36,
              background: `linear-gradient(180deg, ${theme.colors.primary}, ${theme.colors.tertiary})`,
              borderRadius: 2,
              marginBottom: 14,
              boxShadow: `0 0 12px ${theme.colors.primary}35`,
            }}
          />

          <h2
            style={{
              fontSize: 42,
              fontWeight: 800,
              fontFamily: theme.typography.headingFont,
              color: theme.colors.text,
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            {heading}
          </h2>

          {/* 装饰线 */}
          <div
            style={{
              width: lineWidth,
              height: 2,
              background: `linear-gradient(90deg, ${theme.colors.primary}80, transparent)`,
              marginTop: 12,
              borderRadius: 1,
            }}
          />
        </div>

        {/* 下方：要点列表 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {safePoints.map((point, i) => {
            const delay = i * 6;
            const opacity = interpolate(frame, [12 + delay, 25 + delay], [0, 1], { extrapolateRight: "clamp" });
            const y = interpolate(frame, [12 + delay, 25 + delay], [20, 0], { extrapolateRight: "clamp" });
            const accent = accentColors[i % accentColors.length];

            // 渲染层二次保护：限制文本长度
            const displayText = point.text.length > 55
              ? point.text.slice(0, 55) + "…"
              : point.text;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 20px",
                  background: `${theme.colors.surface}70`,
                  borderRadius: 12,
                  border: `1px solid ${accent}12`,
                  borderLeft: `3px solid ${accent}65`,
                  opacity,
                  transform: `translateY(${y}px)`,
                  backdropFilter: "blur(4px)",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {/* emoji 图标 */}
                {point.icon && (
                  <span style={{ fontSize: 22, flexShrink: 0 }}>
                    {point.icon}
                  </span>
                )}

                {/* 序号（无图标时） */}
                {!point.icon && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: `${accent}20`,
                      border: `1px solid ${accent}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: accent,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                )}

                <p
                  style={{
                    fontSize,
                    fontWeight: 500,
                    color: theme.colors.text,
                    margin: 0,
                    fontFamily: theme.typography.bodyFont,
                    lineHeight: 1.4,
                    flex: 1,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                  }}
                >
                  {displayText}
                </p>
              </div>
            );
          })}
        </div>

        {/* 图片信用角标 */}
        {imageUrl && imageCredit && (
          <div
            style={{
              position: "absolute",
              bottom: 125,
              right: 75,
              fontSize: 10,
              color: theme.colors.textMuted,
              opacity: 0.4,
            }}
          >
            📷 {imageCredit}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
