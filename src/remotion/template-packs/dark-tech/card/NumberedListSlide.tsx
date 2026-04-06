import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Background } from "../../../shared/Background";
import { AnimatedText } from "../../../shared/AnimatedText";
import { NumberBadge } from "../../../shared/NumberBadge";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import type { NumberedListSlide as NumberedListSlideData } from "@/lib/types/card-video";

interface Props {
  data: NumberedListSlideData;
}

export const NumberedListSlideComp: React.FC<Props> = ({ data }) => {
  const theme = useTemplateTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background imageUrl={data.imageUrl} imageCredit={data.imageCredit} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          padding: `${theme.spacing.pagePaddingY}px ${theme.spacing.pagePaddingX}px`,
        }}
      >
        {data.heading && (
          <div
            style={{
              marginBottom: 40,
              paddingBottom: 20,
              borderBottom: `2px solid ${theme.colors.borderSubtle}40`,
            }}
          >
            <AnimatedText
              text={data.heading}
              mode="slideUp"
              fontSize={44}
              fontFamily={theme.typography.headingFont}
              fontWeight={800}
              color={theme.colors.text}
              style={{ letterSpacing: 1.5 }}
            />
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
            // 每个卡片从右侧甩入，速度逐渐递减（瀑布效果）
            const enterX = (1 - slideProgress) * (80 + i * 15);

            // 进度连接线 — 上一个卡片到当前卡片
            const lineDelay = cardDelay + 5;
            const lineFrame = Math.max(0, frame - lineDelay);
            const lineProgress = interpolate(lineFrame, [0, 12], [0, 1], {
              extrapolateRight: "clamp",
            });

            return (
              <React.Fragment key={i}>
                {/* 进度连接线 (第一个之前不画) */}
                {i > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      paddingLeft: 55, // 对齐到序号中心
                      height: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 2,
                        height: `${lineProgress * 100}%`,
                        background: `linear-gradient(180deg, ${theme.colors.primary}80, ${theme.colors.primary}20)`,
                        boxShadow: `0 0 8px ${theme.colors.primary}40`,
                      }}
                    />
                  </div>
                )}

                {/* 卡片主体 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 24,
                    padding: "24px 32px",
                    background: "rgba(255, 255, 255, 0.04)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 16,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderLeft: `4px solid ${theme.colors.primary}`,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                    opacity: slideProgress,
                    transform: `translateX(${enterX}px)`,
                  }}
                >
                  <div
                    style={{
                      boxShadow: `0 0 20px ${theme.colors.primary}60`,
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
                color={theme.colors.primary}
                fontWeight={700}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: `1px solid ${theme.colors.primary}40`,
                  background: `${theme.colors.primary}10`,
                  letterSpacing: 1,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
