import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

type PatternType = "circuit" | "wave" | "hexagon" | "dots-grid" | "diagonal-lines";

interface DecorativePatternProps {
  /** 图案类型 */
  pattern?: PatternType;
  /** 整体透明度 */
  opacity?: number;
  /** 图案颜色 (默认使用 theme.colors.primary) */
  color?: string;
  /** 是否启用缓慢漂移动画 */
  animated?: boolean;
  /** 图案缩放 */
  scale?: number;
}

/**
 * SVG 装饰图案层 — 用于为 Slide 添加精致的纹理背景。
 * 5 种预设图案，支持动画漂移和自定义颜色。
 * 渲染为绝对定位覆盖层，置于内容下方。
 */
export const DecorativePattern: React.FC<DecorativePatternProps> = ({
  pattern = "circuit",
  opacity = 0.06,
  color,
  animated = true,
  scale = 1,
}) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const patternColor = color ?? theme.colors.primary;

  // 缓慢漂移偏移量
  const driftX = animated ? Math.sin(frame * 0.008) * 20 : 0;
  const driftY = animated ? Math.cos(frame * 0.006) * 15 : 0;

  const patternId = `dp-${pattern}`;
  const cellSize = Math.round(60 * scale);

  const renderPattern = () => {
    switch (pattern) {
      case "circuit":
        return (
          <pattern id={patternId} width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
            {/* 水平线 */}
            <line x1={0} y1={cellSize / 2} x2={cellSize * 0.4} y2={cellSize / 2}
              stroke={patternColor} strokeWidth={1} />
            {/* 垂直线 */}
            <line x1={cellSize / 2} y1={0} x2={cellSize / 2} y2={cellSize * 0.3}
              stroke={patternColor} strokeWidth={1} />
            {/* 节点圆 */}
            <circle cx={cellSize * 0.4} cy={cellSize / 2} r={2.5}
              fill={patternColor} />
            {/* 拐角线 */}
            <polyline
              points={`${cellSize * 0.4},${cellSize / 2} ${cellSize * 0.7},${cellSize / 2} ${cellSize * 0.7},${cellSize * 0.8}`}
              fill="none" stroke={patternColor} strokeWidth={0.8} />
            <circle cx={cellSize * 0.7} cy={cellSize * 0.8} r={1.5}
              fill={patternColor} />
          </pattern>
        );

      case "wave":
        return (
          <pattern id={patternId} width={cellSize * 2} height={cellSize} patternUnits="userSpaceOnUse">
            <path
              d={`M 0 ${cellSize * 0.5} Q ${cellSize * 0.5} ${cellSize * 0.2}, ${cellSize} ${cellSize * 0.5} T ${cellSize * 2} ${cellSize * 0.5}`}
              fill="none" stroke={patternColor} strokeWidth={1.2}
            />
            <path
              d={`M 0 ${cellSize * 0.8} Q ${cellSize * 0.5} ${cellSize * 0.5}, ${cellSize} ${cellSize * 0.8} T ${cellSize * 2} ${cellSize * 0.8}`}
              fill="none" stroke={patternColor} strokeWidth={0.6} opacity={0.5}
            />
          </pattern>
        );

      case "hexagon": {
        const r = cellSize * 0.35;
        const h = r * Math.sqrt(3) / 2;
        const cx = cellSize / 2;
        const cy = cellSize / 2;
        const points = Array.from({ length: 6 }, (_, i) => {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(" ");
        return (
          <pattern id={patternId} width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
            <polygon points={points} fill="none" stroke={patternColor} strokeWidth={0.8} />
            <circle cx={cx} cy={cy} r={1.5} fill={patternColor} opacity={0.6} />
          </pattern>
        );
      }

      case "dots-grid":
        return (
          <pattern id={patternId} width={cellSize / 2} height={cellSize / 2} patternUnits="userSpaceOnUse">
            <circle cx={cellSize / 4} cy={cellSize / 4} r={1.5} fill={patternColor} />
          </pattern>
        );

      case "diagonal-lines":
        return (
          <pattern id={patternId} width={cellSize / 3} height={cellSize / 3}
            patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={cellSize / 3}
              stroke={patternColor} strokeWidth={0.8} />
          </pattern>
        );
    }
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 0 }}>
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: 0,
          opacity,
          transform: `translate(${driftX}px, ${driftY}px)`,
        }}
      >
        <defs>{renderPattern()}</defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </AbsoluteFill>
  );
};
