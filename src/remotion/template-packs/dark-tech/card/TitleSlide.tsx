import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../../shared/Background";
import { GradientTitle } from "../../../shared/GradientTitle";
import { AnimatedText } from "../../../shared/AnimatedText";
import { AnimatedLine } from "../../../shared/AnimatedLine";
import { ParticleField } from "../../../shared/ParticleField";
import { GlowOrb } from "../../../shared/GlowOrb";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import type { TitleSlide as TitleSlideData } from "@/lib/types/card-video";

interface Props {
  data: TitleSlideData;
}

export const TitleSlideComp: React.FC<Props> = ({ data }) => {
  const theme = useTemplateTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 分类标签从左侧擦入
  const categoryReveal = interpolate(frame, [5, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 副标题用延迟淡入
  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [30, 50], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background imageUrl={data.imageUrl} imageCredit={data.imageCredit} />

      {/* 深空粒子场 */}
      <ParticleField count={15} opacity={0.5} />

      {/* 焦点引导光球 */}
      <GlowOrb x="75%" y="30%" size={500} pulseSpeed={90} />
      <GlowOrb x="20%" y="80%" size={350} color={theme.colors.secondary} pulseSpeed={130} blur={80} />

      {/* 主内容 — 黄金分割偏左下布局 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          height: "100%",
          padding: `${theme.spacing.pagePaddingY + 20}px ${theme.spacing.pagePaddingX + 20}px`,
          paddingBottom: theme.spacing.pagePaddingY + 80,
        }}
      >
        {/* 分类标签 — 极简擦入 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
            opacity: categoryReveal,
            clipPath: `inset(0 ${(1 - categoryReveal) * 100}% 0 0)`,
          }}
        >
          <div
            style={{
              width: 32,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${theme.colors.primary})`,
            }}
          />
          <AnimatedText
            text={data.category}
            mode="fadeIn"
            fontSize={18}
            color={theme.colors.primary}
            fontFamily={theme.typography.bodyFont}
            fontWeight={700}
            style={{ letterSpacing: 6, textTransform: "uppercase" }}
          />
        </div>

        {/* 主标题 — 大字压底 */}
        <GradientTitle
          text={data.heading}
          highlightWords={data.highlightWords}
          fontSize={theme.typography.headingSize + 8}
          delay={8}
        />

        {/* 副标题 */}
        <div
          style={{
            marginTop: 24,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            maxWidth: "85%",
          }}
        >
          <AnimatedText
            text={data.subtitle}
            mode="fadeIn"
            delay={30}
            fontSize={26}
            color={theme.colors.textMuted}
            fontWeight={400}
            style={{ lineHeight: 1.6, letterSpacing: 0.5 }}
          />
        </div>

        {/* 底部装饰线 — 动画生长 */}
        <div style={{ marginTop: 48 }}>
          <AnimatedLine length={100} thickness={3} glow delay={40} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
