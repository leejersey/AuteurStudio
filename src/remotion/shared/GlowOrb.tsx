import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

interface GlowOrbProps {
  /** 光球尺寸 (px) */
  size?: number;
  /** 颜色 */
  color?: string;
  /** 位置 — left (百分比) */
  x?: string;
  /** 位置 — top (百分比) */
  y?: string;
  /** 呼吸脉冲速度 (帧/一周期) */
  pulseSpeed?: number;
  /** 模糊范围 */
  blur?: number;
}

/**
 * 带呼吸脉冲的可配光球 — 装饰层焦点引导。
 * 可放在画面任意位置，缓慢放大缩小、透明度交替，
 * 用于制造焦点和氛围感。
 */
export const GlowOrb: React.FC<GlowOrbProps> = ({
  size = 300,
  color,
  x = "50%",
  y = "50%",
  pulseSpeed = 120,
  blur = 60,
}) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const orbColor = color ?? theme.colors.primary;

  const phase = (frame / pulseSpeed) * Math.PI * 2;
  const scale = 0.85 + Math.sin(phase) * 0.15;
  const opacity = 0.08 + Math.sin(phase * 0.7) * 0.04;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${orbColor} 0%, transparent 70%)`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
      }}
    />
  );
};
