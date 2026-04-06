import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

interface ParticleFieldProps {
  /** 粒子数量 */
  count?: number;
  /** 粒子颜色 (默认使用 theme.colors.primary) */
  color?: string;
  /** 整体透明度 */
  opacity?: number;
}

/**
 * 漂浮光尘粒子场 — 在画面内缓慢漂移的微光点，用于营造深空氛围感。
 * 每个粒子有独立的起始位置、大小、速度和相位，确保自然随机。
 */
export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 12,
  color,
  opacity = 0.6,
}) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const particleColor = color ?? theme.colors.primary;

  // 使用确定性种子生成伪随机粒子参数 (避免每帧重新随机)
  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = i * 137.508; // 黄金角保证均匀分布
      const x = ((seed * 7.3) % 100);
      const y = ((seed * 13.7) % 100);
      const size = 2 + ((seed * 3.1) % 4);
      const speed = 0.15 + ((seed * 1.7) % 0.3);
      const phase = (seed * 2.3) % (Math.PI * 2);
      const driftX = ((seed * 5.9) % 40) - 20; // -20 ~ +20 的横向漂移幅度
      const driftY = ((seed * 4.1) % 30) - 15;
      return { x, y, size, speed, phase, driftX, driftY };
    });
  }, [count]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 1 }}>
      {particles.map((p, i) => {
        const t = frame * p.speed * 0.02;
        const currentX = p.x + Math.sin(t + p.phase) * p.driftX;
        const currentY = p.y + Math.cos(t + p.phase * 0.7) * p.driftY;
        const currentOpacity =
          opacity * (0.3 + 0.7 * Math.abs(Math.sin(t * 0.5 + p.phase)));

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${currentX}%`,
              top: `${currentY}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: particleColor,
              opacity: currentOpacity,
              boxShadow: `0 0 ${p.size * 3}px ${particleColor}`,
              filter: `blur(${p.size * 0.3}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
