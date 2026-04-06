import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

interface SlideTransitionProps {
  children: React.ReactNode;
  durationInFrames: number;
  direction?: "left" | "right" | "up" | "down";
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  durationInFrames,
  direction = "left",
}) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const tf = theme.animation.transitionFrames;

  // 入场动画
  const enterProgress = interpolate(frame, [0, tf], [0, 1], {
    extrapolateRight: "clamp",
  });
  // 出场动画
  const exitProgress = interpolate(
    frame,
    [durationInFrames - tf, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── 闪光脉冲 (Flash Cut) ──
  // 入场瞬间 3 帧极亮白光
  const flashEnter = interpolate(frame, [0, 1, 3], [0.6, 0.3, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  // 出场时也有闪光
  const flashExit = interpolate(
    frame,
    [durationInFrames - 3, durationInFrames - 1, durationInFrames],
    [0, 0.3, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── 模糊穿越 (Blur Through) ──
  const enterBlur = interpolate(frame, [0, tf * 0.6], [12, 0], {
    extrapolateRight: "clamp",
  });
  const exitBlur = interpolate(
    frame,
    [durationInFrames - tf, durationInFrames],
    [0, 12],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const totalBlur = enterBlur + exitBlur;

  const getTransform = () => {
    if (theme.animation.transitionType === "fade") {
      return "none";
    }
    if (theme.animation.transitionType === "zoom") {
      const enterScale = 0.92 + enterProgress * 0.08;
      const exitScale = 1 - exitProgress * 0.08;
      return `scale(${enterScale * exitScale})`;
    }
    // slide (default)
    const enterOffset = (1 - enterProgress) * 60; // 减小偏移量，增强精致感
    const exitOffset = exitProgress * -60;
    const offset = enterOffset + exitOffset;

    switch (direction) {
      case "left":
        return `translateX(${offset}px)`;
      case "right":
        return `translateX(${-offset}px)`;
      case "up":
        return `translateY(${offset}px)`;
      case "down":
        return `translateY(${-offset}px)`;
    }
  };

  const opacity =
    interpolate(enterProgress, [0, 1], [0, 1]) *
    interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: getTransform(),
          opacity,
          filter: totalBlur > 0.5 ? `blur(${totalBlur}px)` : "none",
        }}
      >
        {children}
      </AbsoluteFill>

      {/* 闪光叠加层 */}
      {(flashEnter > 0.01 || flashExit > 0.01) && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, ${theme.colors.primary}40 0%, white 60%)`,
            opacity: flashEnter + flashExit,
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
