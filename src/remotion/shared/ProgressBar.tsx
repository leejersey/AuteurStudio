import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

type ProgressStyle = "bar" | "circular" | "semi-circle";

interface ProgressBarProps {
  /** 目标值 0-100 */
  value: number;
  /** 标签文本 */
  label?: string;
  /** 进度条颜色 */
  color?: string;
  /** 动画延迟帧 */
  delay?: number;
  /** 显示样式 */
  style?: ProgressStyle;
  /** 尺寸 — bar: 宽度, circular/semi-circle: 直径 */
  size?: number;
  /** 轨道粗细 (circular/semi-circle) */
  strokeWidth?: number;
}

/**
 * 动画进度条 / 圆环 / 半圆仪表盘。
 * 使用 spring 动画从 0 增长到目标 value。
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  color,
  delay = 0,
  style: barStyle = "bar",
  size = 200,
  strokeWidth = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTemplateTheme();
  const barColor = color ?? theme.colors.primary;

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 20, mass: 1, stiffness: 60 },
  });

  const currentValue = value * progress;

  // ── 水平条形 ──
  if (barStyle === "bar") {
    return (
      <div style={{ width: size }}>
        {label && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            fontFamily: theme.typography.bodyFont,
            fontSize: theme.typography.detailSize,
          }}>
            <span style={{ color: theme.colors.text }}>{label}</span>
            <span style={{ color: barColor, fontWeight: 700 }}>
              {Math.round(currentValue)}%
            </span>
          </div>
        )}
        <div style={{
          height: strokeWidth,
          borderRadius: strokeWidth,
          background: `${theme.colors.surface}`,
          overflow: "hidden",
        }}>
          <div style={{
            width: `${currentValue}%`,
            height: "100%",
            borderRadius: strokeWidth,
            background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
            boxShadow: `0 0 ${strokeWidth * 2}px ${barColor}60`,
          }} />
        </div>
      </div>
    );
  }

  // ── 圆环 / 半圆 ──
  const radius = (size - strokeWidth) / 2;
  const circumference = barStyle === "semi-circle"
    ? Math.PI * radius
    : 2 * Math.PI * radius;
  const offset = circumference - (currentValue / 100) * circumference;
  const rotation = barStyle === "semi-circle" ? "rotate(-180deg)" : "rotate(-90deg)";
  const viewBoxSize = size;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      width: size,
      height: barStyle === "semi-circle" ? size / 2 + 20 : size,
    }}>
      <svg
        width={size}
        height={barStyle === "semi-circle" ? size / 2 + strokeWidth : size}
        viewBox={`0 0 ${viewBoxSize} ${barStyle === "semi-circle" ? viewBoxSize / 2 + strokeWidth : viewBoxSize}`}
        style={{ transform: rotation, transformOrigin: "center center", overflow: "visible" }}
      >
        {/* 轨道 */}
        <circle
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
          r={radius}
          fill="none"
          stroke={theme.colors.surface}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          {...(barStyle === "semi-circle" ? { strokeDasharray: `${circumference} ${circumference}` } : {})}
        />
        {/* 进度 */}
        <circle
          cx={viewBoxSize / 2}
          cy={viewBoxSize / 2}
          r={radius}
          fill="none"
          stroke={barColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 ${strokeWidth}px ${barColor}60)` }}
        />
      </svg>
      {/* 中心数值 */}
      <div style={{
        position: "absolute",
        top: barStyle === "semi-circle" ? "30%" : "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: size * 0.22,
          fontWeight: 800,
          color: theme.colors.text,
          fontFamily: theme.typography.headingFont,
        }}>
          {Math.round(currentValue)}%
        </div>
        {label && (
          <div style={{
            fontSize: size * 0.09,
            color: theme.colors.textMuted,
            fontFamily: theme.typography.bodyFont,
            marginTop: 4,
          }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
};
