import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../../shared/Background";
import { GradientTitle } from "../../../shared/GradientTitle";
import { AnimatedText } from "../../../shared/AnimatedText";
import { AnimatedLine } from "../../../shared/AnimatedLine";
import { ParticleField } from "../../../shared/ParticleField";
import { GlowOrb } from "../../../shared/GlowOrb";
import { DecorativePattern } from "../../../shared/DecorativePattern";
import { Spotlight } from "../../../shared/Spotlight";
import { WaveBackground } from "../../../shared/WaveBackground";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import type { TitleSlide as TitleSlideData } from "@/lib/types/card-video";

interface Props {
  data: TitleSlideData;
}

export const TitleSlideComp: React.FC<Props> = ({ data }) => {
  const theme = useTemplateTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accentColor = data.colorAccent || theme.colors.primary;

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

      {/* ── 增强装饰层 ── */}
      {/* 电路纹理 — 高可见度 */}
      <DecorativePattern
        pattern={(data.decorations?.find(d => ["circuit", "hexagon", "wave", "dots-grid"].includes(d)) as "circuit" | "hexagon" | "wave" | "dots-grid") || "circuit"}
        opacity={0.12}
        color={accentColor}
      />

      {/* 聚光灯 — 鲜明光束 */}
      <Spotlight
        position="top-left"
        color={accentColor}
        opacity={0.1}
        animated
        rotateSpeed={0.15}
        width={50}
      />
      <Spotlight
        position="top-right"
        color={theme.colors.secondary}
        opacity={0.06}
        animated
        rotateSpeed={-0.1}
        width={35}
      />

      {/* 底部波浪 — 流动感 */}
      <WaveBackground
        layers={3}
        opacity={0.15}
        amplitude={25}
        speed={0.6}
        position="bottom"
        colors={[accentColor, theme.colors.secondary, theme.colors.tertiary]}
      />

      {/* 中央大面积渐变光晕 */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          width: "120%",
          height: "60%",
          transform: "translateX(-50%)",
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${accentColor}15, transparent)`,
          pointerEvents: "none",
        }}
      />

      {/* 深空粒子场 */}
      <ParticleField count={20} opacity={0.6} />

      {/* 焦点引导光球 — 更亮 */}
      <GlowOrb x="75%" y="25%" size={600} pulseSpeed={80} color={accentColor} />
      <GlowOrb x="15%" y="75%" size={400} color={theme.colors.secondary} pulseSpeed={120} blur={80} />

      {/* 主内容 — 黄金分割偏左下布局 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          height: "100%",
          padding: `${theme.spacing.pagePaddingY + 20}px ${theme.spacing.pagePaddingX + 20}px`,
          paddingBottom: theme.spacing.pagePaddingY + 80,
          position: "relative",
          zIndex: 2,
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
              height: 3,
              background: `linear-gradient(90deg, transparent, ${accentColor})`,
              boxShadow: `0 0 10px ${accentColor}60`,
            }}
          />
          <AnimatedText
            text={data.category}
            mode="fadeIn"
            fontSize={18}
            color={accentColor}
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

        {/* 底部装饰线 — 动画生长 + 发光 */}
        <div style={{ marginTop: 48 }}>
          <AnimatedLine length={120} thickness={3} glow delay={40} color={accentColor} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
