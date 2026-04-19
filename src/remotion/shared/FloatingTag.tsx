import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

type FloatingLayout = "scattered" | "arc" | "grid";

interface FloatingTagProps {
  /** 标签数组 */
  tags: string[];
  /** 布局方式 */
  layout?: FloatingLayout;
  /** 标签大小 */
  fontSize?: number;
  /** 动画入场 */
  animated?: boolean;
  /** 基础延迟帧 */
  delay?: number;
}

/**
 * 浮动标签云 — 可散射/弧形/网格排列的标签组。
 * 每个标签独立弹入动画，营造汇聚效果。
 */
export const FloatingTag: React.FC<FloatingTagProps> = ({
  tags,
  layout = "scattered",
  fontSize,
  animated = true,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTemplateTheme();
  const resolvedSize = fontSize ?? theme.typography.tagSize;

  // 散射方向种子表
  const scatterAngles = [
    { x: -70, y: -40 },
    { x: 60, y: -50 },
    { x: -50, y: 40 },
    { x: 80, y: 20 },
    { x: 0, y: -60 },
    { x: -30, y: 60 },
    { x: 70, y: -20 },
    { x: -60, y: -10 },
  ];

  // 弧形布局参数
  const getArcPosition = (index: number, total: number) => {
    const arcRange = Math.PI * 0.6; // 弧高 108°
    const startAngle = Math.PI + (Math.PI - arcRange) / 2;
    const angle = startAngle + (arcRange / (total - 1 || 1)) * index;
    const radius = 120;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.6,
    };
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: layout === "grid" ? 12 : 14,
        justifyContent: "center",
        alignItems: "center",
        position: layout === "scattered" || layout === "arc" ? "relative" : undefined,
      }}
    >
      {tags.map((tag, i) => {
        const tagDelay = delay + i * 5;
        const tagProgress = animated
          ? spring({
              frame: Math.max(0, frame - tagDelay),
              fps,
              config: { damping: 14, mass: 0.6, stiffness: 140 },
            })
          : 1;

        let offsetX = 0;
        let offsetY = 0;

        if (layout === "scattered") {
          const angle = scatterAngles[i % scatterAngles.length];
          offsetX = (1 - tagProgress) * angle.x;
          offsetY = (1 - tagProgress) * angle.y;
        } else if (layout === "arc") {
          const arcPos = getArcPosition(i, tags.length);
          offsetX = tagProgress < 1 ? (1 - tagProgress) * (arcPos.x * 0.5) : 0;
          offsetY = tagProgress < 1 ? (1 - tagProgress) * (arcPos.y * 0.5 - 30) : 0;
        }

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              padding: `${resolvedSize * 0.4}px ${resolvedSize * 1}px`,
              borderRadius: 24,
              border: `1px solid ${theme.colors.borderSubtle}50`,
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(8px)",
              fontSize: resolvedSize,
              color: theme.colors.textMuted,
              fontFamily: theme.typography.bodyFont,
              opacity: tagProgress,
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${0.8 + tagProgress * 0.2})`,
              letterSpacing: 1,
            }}
          >
            #{tag}
          </span>
        );
      })}
    </div>
  );
};
