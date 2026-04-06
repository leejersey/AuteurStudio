import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Background } from "../../../shared/Background";
import { AnimatedText } from "../../../shared/AnimatedText";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import type { StepsSlide as StepsSlideData } from "@/lib/types/card-video";

interface Props {
  data: StepsSlideData;
}

export const StepsSlideComp: React.FC<Props> = ({ data }) => {
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
        <div style={{ marginBottom: 12 }}>
          <AnimatedText
            text={data.heading}
            mode="slideUp"
            fontSize={42}
            fontFamily={theme.typography.headingFont}
            fontWeight={800}
            color={theme.colors.text}
            style={{ letterSpacing: 1.5 }}
          />
        </div>
        {data.subheading && (
          <AnimatedText
            text={data.subheading}
            mode="fadeIn"
            delay={8}
            fontSize={theme.typography.detailSize}
            color={theme.colors.textMuted}
            style={{ marginBottom: 40 }}
          />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingBottom: 20, position: "relative" }}>
          {data.steps.map((step, i) => {
            const cardDelay = i * 10 + 15;
            const cardFrame = Math.max(0, frame - cardDelay);
            const slideProgress = spring({
              frame: cardFrame,
              fps,
              config: { damping: 16, mass: 0.7, stiffness: 120 },
            });
            const enterX = (1 - slideProgress) * (70 + i * 12);

            // 进度连接线
            const lineDelay = cardDelay + 3;
            const lineFrame = Math.max(0, frame - lineDelay);
            const lineProgress = interpolate(lineFrame, [0, 10], [0, 1], {
              extrapolateRight: "clamp",
            });

            return (
              <React.Fragment key={i}>
                {/* 进度连接线 */}
                {i > 0 && (
                  <div
                    style={{
                      display: "flex",
                      paddingLeft: 55,
                      height: 16,
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

                {/* 步骤卡片 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    background: "rgba(255, 255, 255, 0.04)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 16,
                    padding: "24px 32px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderLeft: `4px solid ${theme.colors.primary}`,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                    opacity: slideProgress,
                    transform: `translateX(${enterX}px)`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: theme.colors.background,
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDim})`,
                      fontFamily: theme.typography.headingFont,
                      minWidth: 48,
                      height: 48,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 20px ${theme.colors.primary}60`,
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <AnimatedText
                      text={step.action}
                      mode="slideUp"
                      delay={cardDelay + 2}
                      fontSize={26}
                      fontWeight={500}
                      color={theme.colors.text}
                      style={{ lineHeight: 1.6 }}
                    />
                  </div>
                  {step.note && (
                    <div style={{ marginLeft: 16 }}>
                      <AnimatedText
                        text={step.note}
                        mode="fadeIn"
                        delay={cardDelay + 8}
                        fontSize={20}
                        color="#A0AAB4"
                        style={{
                          background: "rgba(0,0,0,0.3)",
                          padding: "6px 14px",
                          borderRadius: 10,
                          backdropFilter: "blur(8px)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {data.linkCard && (
          <div
            style={{
              marginTop: 30,
              padding: "18px 28px",
              background: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(16px)",
              borderRadius: 16,
              border: `1px solid ${theme.colors.primary}30`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: `0 0 20px ${theme.colors.primary}15`,
            }}
          >
            <span style={{ fontSize: 22 }}>🔗</span>
            <AnimatedText
              text={data.linkCard.title}
              mode="fadeIn"
              delay={50}
              fontSize={22}
              color={theme.colors.primary}
              fontWeight={600}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
