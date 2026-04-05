import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles/theme";

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

  const scale = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 200 },
  });

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDim})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
        boxShadow: `0 0 20px ${COLORS.primary}40`,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: size * 0.45,
          fontWeight: 800,
          color: COLORS.onPrimary,
          fontFamily: FONTS.headline,
        }}
      >
        {number}
      </span>
    </div>
  );
};
