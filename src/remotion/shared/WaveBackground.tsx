import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

interface WaveBackgroundProps {
  /** 波浪层数 */
  layers?: number;
  /** 颜色数组 (每层一色) */
  colors?: string[];
  /** 波浪速度倍率 */
  speed?: number;
  /** 波浪振幅 (px) */
  amplitude?: number;
  /** 整体透明度 */
  opacity?: number;
  /** 位置：底部或全屏 */
  position?: "bottom" | "full";
}

/**
 * 多层 SVG 波浪背景 — 缓慢水平流动的波浪叠加层。
 * 用于 Slide 底部或全屏装饰，营造流动感。
 * 每层波浪有独立的频率和相位，确保自然感。
 */
export const WaveBackground: React.FC<WaveBackgroundProps> = ({
  layers = 3,
  colors,
  speed = 1,
  amplitude = 30,
  opacity = 0.1,
  position = "bottom",
}) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();

  const defaultColors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.tertiary,
    theme.colors.primaryDim,
  ];
  const resolvedColors = colors ?? defaultColors;

  const viewBoxWidth = 1200;
  const viewBoxHeight = position === "bottom" ? 200 : 400;

  // 生成每层波浪路径
  const generateWavePath = (
    layerIndex: number,
    totalLayers: number
  ): string => {
    const baseY = position === "bottom"
      ? viewBoxHeight * (0.3 + (layerIndex / totalLayers) * 0.4)
      : viewBoxHeight * (0.2 + (layerIndex / totalLayers) * 0.6);

    const freq = 1.5 + layerIndex * 0.3;
    const phase = frame * speed * 0.02 * (1 + layerIndex * 0.2);
    const amp = amplitude * (1 - layerIndex * 0.15);

    const points: string[] = [];
    const segments = 20;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * viewBoxWidth;
      const y =
        baseY +
        Math.sin((i / segments) * Math.PI * freq + phase) * amp +
        Math.sin((i / segments) * Math.PI * freq * 0.5 + phase * 1.3) * (amp * 0.3);
      points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }

    // 闭合到底部
    points.push(`L ${viewBoxWidth} ${viewBoxHeight}`);
    points.push(`L 0 ${viewBoxHeight}`);
    points.push("Z");

    return points.join(" ");
  };

  const containerStyle: React.CSSProperties = position === "bottom"
    ? { position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", pointerEvents: "none" }
    : { position: "absolute", inset: 0, pointerEvents: "none" };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 0 }}>
      <div style={containerStyle}>
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", opacity }}
        >
          {Array.from({ length: layers }, (_, i) => (
            <path
              key={i}
              d={generateWavePath(i, layers)}
              fill={resolvedColors[i % resolvedColors.length]}
              opacity={0.6 - i * 0.1}
            />
          ))}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
