import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

type DividerStyle = "gradient" | "dashed" | "dots" | "wave";

interface DividerProps {
  /** 分隔线样式 */
  variant?: DividerStyle;
  /** 长度 (px 或 "100%") */
  length?: number | string;
  /** 颜色 */
  color?: string;
  /** 发光效果 */
  glow?: boolean;
  /** 动画生长 */
  animated?: boolean;
  /** 动画延迟帧 */
  delay?: number;
  /** 粗细 */
  thickness?: number;
}

/**
 * 增强装饰分隔线 — 4 种预设风格，支持动画生长和发光效果。
 * 用于替代简单水平线，增强 Slide 的版面节奏感。
 */
export const Divider: React.FC<DividerProps> = ({
  variant = "gradient",
  length = "100%",
  color,
  glow = false,
  animated = true,
  delay = 0,
  thickness = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTemplateTheme();
  const lineColor = color ?? theme.colors.primary;

  const progress = animated
    ? spring({
        frame: Math.max(0, frame - delay),
        fps,
        config: { damping: 18, mass: 0.8, stiffness: 80 },
      })
    : 1;

  const resolvedLength = typeof length === "number" ? `${length}px` : length;

  const glowShadow = glow ? `0 0 ${thickness * 4}px ${lineColor}60` : "none";

  if (variant === "dots") {
    const dotCount = 5;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          width: resolvedLength,
        }}
      >
        {Array.from({ length: dotCount }, (_, i) => {
          const dotDelay = delay + i * 3;
          const dotProgress = spring({
            frame: Math.max(0, frame - dotDelay),
            fps,
            config: { damping: 10, mass: 0.5, stiffness: 200 },
          });
          return (
            <div
              key={i}
              style={{
                width: thickness * 2.5,
                height: thickness * 2.5,
                borderRadius: "50%",
                background: lineColor,
                transform: `scale(${dotProgress})`,
                opacity: dotProgress,
                boxShadow: glow ? `0 0 ${thickness * 3}px ${lineColor}` : "none",
              }}
            />
          );
        })}
      </div>
    );
  }

  if (variant === "wave") {
    const svgWidth = 200;
    const svgHeight = thickness * 6;
    return (
      <div style={{ width: resolvedLength, overflow: "hidden", opacity: progress }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: "100%", height: svgHeight }}
          preserveAspectRatio="none"
        >
          <path
            d={`M 0 ${svgHeight / 2} Q ${svgWidth * 0.125} 0, ${svgWidth * 0.25} ${svgHeight / 2} T ${svgWidth * 0.5} ${svgHeight / 2} T ${svgWidth * 0.75} ${svgHeight / 2} T ${svgWidth} ${svgHeight / 2}`}
            fill="none"
            stroke={lineColor}
            strokeWidth={thickness}
            strokeLinecap="round"
            style={{ filter: glow ? `drop-shadow(0 0 ${thickness * 2}px ${lineColor})` : "none" }}
          />
        </svg>
      </div>
    );
  }

  // gradient / dashed
  return (
    <div
      style={{
        width: resolvedLength,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: thickness,
          borderRadius: thickness,
          background:
            variant === "dashed"
              ? `repeating-linear-gradient(90deg, ${lineColor}, ${lineColor} 8px, transparent 8px, transparent 16px)`
              : `linear-gradient(90deg, transparent, ${lineColor}, transparent)`,
          boxShadow: glowShadow,
        }}
      />
    </div>
  );
};
