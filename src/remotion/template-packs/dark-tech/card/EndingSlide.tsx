import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Background } from "../../../shared/Background";
import { AnimatedText } from "../../../shared/AnimatedText";
import { AnimatedLine } from "../../../shared/AnimatedLine";
import { ParticleField } from "../../../shared/ParticleField";
import { GlowOrb } from "../../../shared/GlowOrb";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import type { EndingSlide as EndingSlideData } from "@/lib/types/card-video";

interface Props {
  data: EndingSlideData;
}

export const EndingSlideComp: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTemplateTheme();

  const avatarScale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 120 },
  });

  // 光环脉冲 — 3 圈同心环依次扩散
  const rings = [0, 8, 16].map((ringDelay) => {
    const ringFrame = Math.max(0, frame - ringDelay);
    const ringProgress = interpolate(ringFrame % 90, [0, 90], [0, 1], {
      extrapolateRight: "clamp",
    });
    const ringScale = 1 + ringProgress * 1.2;
    const ringOpacity = interpolate(ringProgress, [0, 0.3, 1], [0, 0.4, 0]);
    return { ringScale, ringOpacity };
  });

  return (
    <AbsoluteFill>
      <Background imageUrl={data.imageUrl} imageCredit={data.imageCredit} />

      {/* 深空粒子场 */}
      <ParticleField count={18} opacity={0.4} color={theme.colors.secondary} />

      {/* 焦点光球 */}
      <GlowOrb x="50%" y="40%" size={600} pulseSpeed={100} color={theme.colors.primary} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: `${theme.spacing.pagePaddingY}px ${theme.spacing.pagePaddingX}px`,
          textAlign: "center",
        }}
      >
        {/* 头像 + 脉冲光环 */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          {/* 扩散光环 */}
          {rings.map((ring, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: `2px solid ${theme.colors.primary}`,
                transform: `translate(-50%, -50%) scale(${ring.ringScale})`,
                opacity: ring.ringOpacity,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* 头像主体 */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${avatarScale})`,
              boxShadow: `0 0 60px ${theme.colors.primary}40, inset 0 0 20px rgba(255,255,255,0.1)`,
              position: "relative",
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontSize: 44,
                fontWeight: 800,
                color: theme.colors.onPrimary,
                fontFamily: theme.typography.headingFont,
              }}
            >
              {data.authorName.charAt(0)}
            </span>
          </div>
        </div>

        {/* 作者名字 */}
        <AnimatedText
          text={data.authorName}
          mode="slideUp"
          delay={8}
          fontSize={theme.typography.bodySize}
          fontFamily={theme.typography.headingFont}
          fontWeight={700}
          color={theme.colors.text}
          style={{ letterSpacing: 2 }}
        />

        {/* CTA */}
        <div style={{ marginTop: 40 }}>
          <AnimatedText
            text={data.callToAction}
            mode="slideUp"
            delay={20}
            fontSize={40}
            fontWeight={800}
            color={theme.colors.primary}
            style={{
              textShadow: `0 0 30px ${theme.colors.primary}60`,
              letterSpacing: 1,
            }}
          />
        </div>

        {/* 标签 — 散射汇聚入场 */}
        {data.tags && data.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 40,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {data.tags.map((tag, i) => {
              const tagDelay = 35 + i * 5;
              const tagFrame = Math.max(0, frame - tagDelay);
              const tagProgress = spring({
                frame: tagFrame,
                fps,
                config: { damping: 14, mass: 0.6, stiffness: 140 },
              });
              // 散射方向：交替从不同方向飞来
              const angles = [
                { x: -60, y: -30 },
                { x: 50, y: -40 },
                { x: -40, y: 30 },
                { x: 60, y: 20 },
                { x: 0, y: -50 },
              ];
              const angle = angles[i % angles.length];
              const offsetX = (1 - tagProgress) * angle.x;
              const offsetY = (1 - tagProgress) * angle.y;

              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    padding: "8px 18px",
                    borderRadius: 24,
                    border: `1px solid ${theme.colors.borderSubtle}40`,
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(8px)",
                    fontSize: 18,
                    color: theme.colors.textMuted,
                    opacity: tagProgress,
                    transform: `translate(${offsetX}px, ${offsetY}px) scale(${0.8 + tagProgress * 0.2})`,
                    letterSpacing: 1,
                  }}
                >
                  #{tag}
                </span>
              );
            })}
          </div>
        )}

        {/* 底部装饰 — 动画生长线 */}
        <div
          style={{
            marginTop: 60,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <AnimatedLine length={50} thickness={2} glow delay={50} />
          <AnimatedText
            text="感谢观看"
            mode="fadeIn"
            delay={55}
            fontSize={theme.typography.tagSize}
            color={theme.colors.textMuted}
            style={{ letterSpacing: 8 }}
          />
          <AnimatedLine length={50} thickness={2} glow delay={50} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
