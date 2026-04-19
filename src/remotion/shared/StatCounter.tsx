import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

interface StatCounterProps {
  /** 目标数值 */
  value: number;
  /** 后缀，如 "%" "K" "M" "+" */
  suffix?: string;
  /** 前缀，如 "$" "¥" */
  prefix?: string;
  /** 底部标签说明 */
  label: string;
  /** 颜色 */
  color?: string;
  /** 数字字号 */
  fontSize?: number;
  /** 动画延迟帧 */
  delay?: number;
}

/**
 * 数字滚动计数器 — 大数字从0滚动到目标值。
 * 常用于数据统计展示页，视觉冲击力强。
 */
export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  suffix = "",
  prefix = "",
  label,
  color,
  fontSize,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTemplateTheme();
  const valueColor = color ?? theme.colors.primary;
  const resolvedSize = fontSize ?? theme.typography.headingSize;

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 25, mass: 1.2, stiffness: 50 },
  });

  const currentValue = Math.round(value * progress);

  // 入场缩放
  const scaleProgress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 140 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        transform: `scale(${0.8 + scaleProgress * 0.2})`,
        opacity: scaleProgress,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
        }}
      >
        {prefix && (
          <span
            style={{
              fontSize: resolvedSize * 0.5,
              fontWeight: 700,
              color: valueColor,
              fontFamily: theme.typography.headingFont,
            }}
          >
            {prefix}
          </span>
        )}
        <span
          style={{
            fontSize: resolvedSize,
            fontWeight: 900,
            color: valueColor,
            fontFamily: theme.typography.headingFont,
            textShadow: `0 0 30px ${valueColor}40`,
            lineHeight: 1,
          }}
        >
          {currentValue.toLocaleString()}
        </span>
        {suffix && (
          <span
            style={{
              fontSize: resolvedSize * 0.45,
              fontWeight: 700,
              color: valueColor,
              fontFamily: theme.typography.headingFont,
              opacity: 0.8,
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: theme.typography.detailSize,
          color: theme.colors.textMuted,
          fontFamily: theme.typography.bodyFont,
          letterSpacing: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
};
