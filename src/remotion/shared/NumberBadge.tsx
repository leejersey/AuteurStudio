import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

interface NumberBadgeProps {
  number: number;
  delay?: number;
  size?: number;
}

export const NumberBadge: React.FC<NumberBadgeProps> = ({
  number,
  delay = 0,
  size = 48,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTemplateTheme();

  const scale = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 200 },
  });

  const badgeRadius =
    theme.decoration.badgeStyle === "circle"
      ? "50%"
      : theme.decoration.badgeStyle === "pill"
        ? `${size}px`
        : "8px";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: badgeRadius,
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDim})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
        boxShadow: `0 0 20px ${theme.colors.primary}40`,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: size * 0.45,
          fontWeight: 800,
          color: theme.colors.onPrimary,
          fontFamily: theme.typography.headingFont,
        }}
      >
        {number}
      </span>
    </div>
  );
};
