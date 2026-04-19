import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Background } from "../../../shared/Background";
import { AnimatedText } from "../../../shared/AnimatedText";
import { Spotlight } from "../../../shared/Spotlight";
import { WaveBackground } from "../../../shared/WaveBackground";
import { DecorativePattern } from "../../../shared/DecorativePattern";
import { GlowOrb } from "../../../shared/GlowOrb";
import { ParticleField } from "../../../shared/ParticleField";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import type { HighlightSlide as HighlightSlideData } from "@/lib/types/card-video";

interface Props {
  data: HighlightSlideData;
}

export const HighlightSlideComp: React.FC<Props> = ({ data }) => {
  const theme = useTemplateTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const decoration = data.decoration || "spotlight";
  const accentColor = data.colorAccent || theme.colors.primary;

  // 主文本入场 — 弹入缩放
  const textScale = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 80 },
  });

  // 副文本淡入
  const subtextOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtextY = interpolate(frame, [30, 50], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 引号装饰
  const quoteOpacity = interpolate(frame, [0, 15], [0, 0.1], {
    extrapolateRight: "clamp",
  });
  const quoteScale = spring({
    frame,
    fps,
    config: { damping: 20, mass: 1, stiffness: 40 },
  });

  // 底线生长
  const lineProgress = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: { damping: 18, mass: 0.8, stiffness: 80 },
  });

  // 背景脉冲 — 渐变呼吸效果
  const pulse = interpolate(
    frame % 120,
    [0, 60, 120],
    [0.12, 0.18, 0.12],
  );

  return (
    <AbsoluteFill>
      <Background imageUrl={data.imageUrl} imageCredit={data.imageCredit} />

      {/* 全屏渐变底色 — 比其他页面更浓 */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 50% 45%, ${accentColor}${Math.round(pulse * 255).toString(16).padStart(2, '0')}, transparent)`,
        pointerEvents: "none",
      }} />

      {/* 装饰效果层 — 全部增强 */}
      {decoration === "spotlight" && (
        <>
          <Spotlight position="top-left" color={accentColor} opacity={0.12} width={55} animated rotateSpeed={0.15} />
          <Spotlight position="top-right" color={theme.colors.secondary} opacity={0.08} width={40} animated rotateSpeed={-0.12} />
        </>
      )}
      {decoration === "wave" && (
        <WaveBackground layers={4} opacity={0.15} amplitude={30} speed={0.8} position="full" colors={[accentColor, theme.colors.secondary, theme.colors.tertiary]} />
      )}
      {decoration === "pattern" && (
        <DecorativePattern pattern="hexagon" opacity={0.12} animated scale={1.5} color={accentColor} />
      )}

      {/* 粒子场 */}
      <ParticleField count={20} opacity={0.5} />

      {/* 焦点光球 — 更大更亮 */}
      <GlowOrb x="50%" y="42%" size={650} pulseSpeed={90} color={accentColor} />
      <GlowOrb x="25%" y="65%" size={350} pulseSpeed={130} color={theme.colors.secondary} blur={80} />
      <GlowOrb x="75%" y="30%" size={250} pulseSpeed={160} color={theme.colors.tertiary} blur={60} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: `${theme.spacing.pagePaddingY + 20}px ${theme.spacing.pagePaddingX + 30}px`,
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* 巨型引号装饰 — 更大更明显 */}
        <div
          style={{
            position: "absolute",
            top: "12%",
            left: "8%",
            fontSize: 400,
            fontFamily: "Georgia, serif",
            color: accentColor,
            opacity: quoteOpacity,
            transform: `scale(${quoteScale})`,
            lineHeight: 0.8,
            pointerEvents: "none",
            textShadow: `0 0 80px ${accentColor}30`,
          }}
        >
          "
        </div>

        {/* 右下闭合引号 */}
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "8%",
            fontSize: 300,
            fontFamily: "Georgia, serif",
            color: theme.colors.secondary,
            opacity: quoteOpacity * 0.6,
            transform: `scale(${quoteScale}) rotate(180deg)`,
            lineHeight: 0.8,
            pointerEvents: "none",
          }}
        >
          "
        </div>

        {/* 核心文本 — 加大字号 + 渐变发光 */}
        <div
          style={{
            transform: `scale(${0.85 + textScale * 0.15})`,
            opacity: textScale,
            maxWidth: "85%",
          }}
        >
          <AnimatedText
            text={data.text}
            mode="slideUp"
            delay={5}
            fontSize={theme.typography.headingSize}
            fontFamily={theme.typography.headingFont}
            fontWeight={900}
            color={theme.colors.text}
            style={{
              lineHeight: 1.35,
              letterSpacing: 1.5,
              textShadow: `0 0 80px ${accentColor}30, 0 4px 20px rgba(0,0,0,0.5)`,
            }}
          />
        </div>

        {/* 副文本 */}
        {data.subtext && (
          <div
            style={{
              marginTop: 36,
              opacity: subtextOpacity,
              transform: `translateY(${subtextY}px)`,
              maxWidth: "75%",
            }}
          >
            <AnimatedText
              text={data.subtext}
              mode="fadeIn"
              delay={30}
              fontSize={theme.typography.bodySize + 2}
              color={theme.colors.textMuted}
              style={{ lineHeight: 1.6 }}
            />
          </div>
        )}

        {/* 装饰底线 — 更长更亮 */}
        <div
          style={{
            marginTop: 50,
            width: `${lineProgress * 160}px`,
            height: 4,
            borderRadius: 4,
            background: `linear-gradient(90deg, transparent, ${accentColor}, ${theme.colors.secondary}, transparent)`,
            boxShadow: `0 0 20px ${accentColor}60, 0 0 40px ${accentColor}20`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
