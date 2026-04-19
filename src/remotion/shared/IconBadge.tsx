import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

type BadgeShape = "circle" | "rounded-square" | "hexagon";

interface IconBadgeProps {
  /** 图标内容：emoji 字符串 或 "material:icon_name" 格式 */
  icon: string;
  /** 外形 */
  shape?: BadgeShape;
  /** 尺寸 (px) */
  size?: number;
  /** 渐变色 [start, end]，默认使用 theme primary */
  gradient?: [string, string];
  /** 发光颜色 */
  glowColor?: string;
  /** 是否启用弹入动画 */
  animate?: boolean;
  /** 动画延迟帧数 */
  delay?: number;
}

/**
 * 带容器的图标组件 — 统一的图标呈现方式。
 * 自动识别 emoji vs Material Symbol（"material:" 前缀）。
 * 支持圆形/圆角方形/六边形容器 + 渐变 + 发光 + 弹入动画。
 */
export const IconBadge: React.FC<IconBadgeProps> = ({
  icon,
  shape = "circle",
  size = 56,
  gradient,
  glowColor,
  animate = true,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTemplateTheme();

  const [gradStart, gradEnd] = gradient ?? [theme.colors.primary, theme.colors.primaryDim];
  const glow = glowColor ?? theme.colors.primary;

  const scale = animate
    ? spring({
        frame: Math.max(0, frame - delay),
        fps,
        config: { damping: 12, mass: 0.5, stiffness: 200 },
      })
    : 1;

  // Material Symbol 检测
  const isMaterial = icon.startsWith("material:");
  const materialName = isMaterial ? icon.replace("material:", "") : "";

  // 外形样式
  const getClipPath = (): string | undefined => {
    if (shape === "hexagon") {
      return "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";
    }
    return undefined;
  };

  const getBorderRadius = (): string => {
    switch (shape) {
      case "circle": return "50%";
      case "rounded-square": return `${size * 0.22}px`;
      case "hexagon": return "0";
    }
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: getBorderRadius(),
        clipPath: getClipPath(),
        background: `linear-gradient(135deg, ${gradStart}, ${gradEnd})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${size * 0.4}px ${glow}50`,
        flexShrink: 0,
      }}
    >
      {isMaterial ? (
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: size * 0.5,
            color: theme.colors.onPrimary,
            fontWeight: 300,
          }}
        >
          {materialName}
        </span>
      ) : (
        <span
          style={{
            fontSize: size * 0.5,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </span>
      )}
    </div>
  );
};
