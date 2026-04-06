import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

interface AnimatedLineProps {
  /** 方向 */
  direction?: "horizontal" | "vertical";
  /** 最终长度 (px) */
  length?: number;
  /** 粗细 (px) */
  thickness?: number;
  /** 颜色 */
  color?: string;
  /** 延迟帧数 */
  delay?: number;
  /** 是否使用渐变发光效果 */
  glow?: boolean;
}

/**
 * 可控长度/方向的线条绘制动画。
 * 从 0 长度生长到目标长度，带有弹性缓动和可选发光。
 */
export const AnimatedLine: React.FC<AnimatedLineProps> = ({
  direction = "horizontal",
  length = 80,
  thickness = 2,
  color,
  delay = 0,
  glow = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTemplateTheme();
  const lineColor = color ?? theme.colors.primary;

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 15, mass: 0.8, stiffness: 100 },
  });

  const currentLength = length * progress;

  const isHorizontal = direction === "horizontal";

  return (
    <div
      style={{
        width: isHorizontal ? currentLength : thickness,
        height: isHorizontal ? thickness : currentLength,
        background: `linear-gradient(${isHorizontal ? "90deg" : "180deg"}, transparent, ${lineColor}, transparent)`,
        borderRadius: thickness,
        boxShadow: glow ? `0 0 ${thickness * 6}px ${lineColor}60` : "none",
        transition: "none",
      }}
    />
  );
};
