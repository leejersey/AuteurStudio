import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Background } from "../../../shared/Background";
import { AnimatedText } from "../../../shared/AnimatedText";
import { NumberBadge } from "../../../shared/NumberBadge";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { DecorativePattern } from "../../../shared/DecorativePattern";
import { WaveBackground } from "../../../shared/WaveBackground";
import { Divider } from "../../../shared/Divider";
import type { NumberedListSlide as NumberedListSlideData } from "@/lib/types/card-video";

interface Props {
  data: NumberedListSlideData;
}

export const NumberedListSlideComp: React.FC<Props> = ({ data }) => {
  const theme = useTemplateTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accentColor = data.colorAccent || theme.colors.primary;

  return (
    <AbsoluteFill>
      <Background imageUrl={data.imageUrl} imageCredit={data.imageCredit} />

      {/* 装饰层 — 可见度大幅提升 */}
      <DecorativePattern
        pattern={(data.decorations?.find(d => ["circuit", "hexagon", "wave", "dots-grid", "diagonal-lines"].includes(d)) as "circuit" | "hexagon" | "wave" | "dots-grid" | "diagonal-lines") || "dots-grid"}
        opacity={0.12}
        color={accentColor}
      />

      {/* 底部波浪装饰 */}
      <WaveBackground
        layers={3}
        opacity={0.15}
        amplitude={20}
        speed={0.5}
        position="bottom"
        colors={[accentColor, theme.colors.secondary, theme.colors.tertiary]}
      />

      {/* 顶部渐变光晕 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${accentColor}18, transparent)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          padding: `${theme.spacing.pagePaddingY}px ${theme.spacing.pagePaddingX}px`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {data.heading && (
          <div style={{ marginBottom: 36 }}>
            <AnimatedText
              text={data.heading}
              mode="slideUp"
              fontSize={44}
              fontFamily={theme.typography.headingFont}
              fontWeight={800}
              color={theme.colors.text}
              style={{ letterSpacing: 1.5 }}
            />
            {/* 标题下方渐变强调线 */}
            <div style={{ marginTop: 16 }}>
              <Divider
                variant="gradient"
                color={accentColor}
                glow
                animated
                thickness={3}
                length={200}
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingBottom: 20, position: "relative" }}>
          {data.items.map((item, i) => {
            const cardDelay = i * theme.animation.staggerDelay + 10;
            const cardFrame = Math.max(0, frame - cardDelay);
            const slideProgress = spring({
              frame: cardFrame,
              fps,
              config: { damping: 16, mass: 0.7, stiffness: 120 },
            });
            const enterX = (1 - slideProgress) * (80 + i * 15);

            // 进度连接线
            const lineDelay = cardDelay + 5;
            const lineFrame = Math.max(0, frame - lineDelay);
            const lineProgress = interpolate(lineFrame, [0, 12], [0, 1], {
              extrapolateRight: "clamp",
            });

            // 每张卡片交替使用不同的强调色
            const cardColors = [accentColor, theme.colors.secondary, theme.colors.tertiary, theme.colors.primaryDim];
            const cardColor = cardColors[i % cardColors.length];

            return (
              <React.Fragment key={i}>
                {/* 进度连接线 */}
                {i > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      paddingLeft: 55,
                      height: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 2,
                        height: `${lineProgress * 100}%`,
                        background: `linear-gradient(180deg, ${cardColor}80, ${cardColor}20)`,
                        boxShadow: `0 0 12px ${cardColor}60`,
                      }}
                    />
                  </div>
                )}

                {/* 卡片主体 — 增强渐变边框和发光 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 24,
                    padding: "24px 32px",
                    background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
                    backdropFilter: "blur(16px)",
                    borderRadius: 16,
                    border: `1px solid ${cardColor}30`,
                    borderLeft: `4px solid ${cardColor}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 ${cardColor}15, 0 0 40px ${cardColor}08`,
                    opacity: slideProgress,
                    transform: `translateX(${enterX}px)`,
                  }}
                >
                  <div
                    style={{
                      boxShadow: `0 0 25px ${cardColor}60`,
                      borderRadius: "50%",
                      marginTop: 2,
                    }}
                  >
                    <NumberBadge number={i + 1} delay={cardDelay} size={48} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <AnimatedText
                      text={item.text}
                      mode="slideUp"
                      delay={cardDelay + 2}
                      fontSize={26}
                      fontWeight={500}
                      color={theme.colors.text}
                      style={{ lineHeight: 1.6 }}
                    />
                    {item.detail && (
                      <div style={{ marginTop: 12 }}>
                        <AnimatedText
                          text={item.detail}
                          mode="fadeIn"
                          delay={cardDelay + 8}
                          fontSize={20}
                          color="#A0AAB4"
                          style={{ lineHeight: 1.5 }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {data.tags && data.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: theme.spacing.sectionGap,
              flexWrap: "wrap",
            }}
          >
            {data.tags.map((tag, i) => (
              <AnimatedText
                key={i}
                text={tag}
                mode="fadeIn"
                delay={40 + i * 5}
                fontSize={theme.typography.tagSize}
                color={accentColor}
                fontWeight={700}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: `1px solid ${accentColor}40`,
                  background: `${accentColor}15`,
                  letterSpacing: 1,
                  boxShadow: `0 0 15px ${accentColor}10`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
