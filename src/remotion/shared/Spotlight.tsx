import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

interface SpotlightProps {
  /** 聚光灯角度 (度数) */
  angle?: number;
  /** 颜色 */
  color?: string;
  /** 光束宽度 (度数) */
  width?: number;
  /** 是否启用缓慢旋转动画 */
  animated?: boolean;
  /** 旋转速度 (度/帧) */
  rotateSpeed?: number;
  /** 脉冲速度 (帧/周期) */
  pulseSpeed?: number;
  /** 透明度 */
  opacity?: number;
  /** 光源位置 */
  position?: "top-left" | "top-right" | "top-center" | "bottom-center";
}

/**
 * 聚光灯效果 — 锥形光束覆盖层，用于引导视觉焦点。
 * 支持缓慢旋转和脉冲效果。
 */
export const Spotlight: React.FC<SpotlightProps> = ({
  angle = 0,
  color,
  width = 40,
  animated = true,
  rotateSpeed = 0.1,
  pulseSpeed = 120,
  opacity = 0.08,
  position = "top-left",
}) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const spotColor = color ?? theme.colors.primary;

  const currentAngle = animated ? angle + frame * rotateSpeed : angle;
  const pulse = animated
    ? 0.6 + 0.4 * Math.sin((frame / pulseSpeed) * Math.PI * 2)
    : 1;

  // 光源位置
  const positionMap: Record<string, { left: string; top: string; transformOrigin: string }> = {
    "top-left": { left: "0%", top: "0%", transformOrigin: "0% 0%" },
    "top-right": { left: "100%", top: "0%", transformOrigin: "100% 0%" },
    "top-center": { left: "50%", top: "0%", transformOrigin: "50% 0%" },
    "bottom-center": { left: "50%", top: "100%", transformOrigin: "50% 100%" },
  };
  const pos = positionMap[position] ?? positionMap["top-left"];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: pos.left,
          top: pos.top,
          width: "200%",
          height: "200%",
          transform: `translate(-50%, -50%) rotate(${currentAngle}deg)`,
          transformOrigin: pos.transformOrigin,
          background: `conic-gradient(
            from ${-width / 2}deg at 50% 50%,
            transparent 0deg,
            ${spotColor} ${width * 0.3}deg,
            ${spotColor} ${width * 0.7}deg,
            transparent ${width}deg
          )`,
          opacity: opacity * pulse,
          filter: "blur(30px)",
        }}
      />
    </AbsoluteFill>
  );
};
