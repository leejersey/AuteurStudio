import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../styles/theme";

interface BackgroundProps {
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

export const Background: React.FC<BackgroundProps> = ({
  style = "dark-tech",
}) => {
  const gradients: Record<string, string> = {
    "dark-tech": `radial-gradient(ellipse at 20% 80%, ${COLORS.primary}15 0%, transparent 50%),
                  radial-gradient(ellipse at 80% 20%, ${COLORS.secondary}10 0%, transparent 50%),
                  linear-gradient(180deg, ${COLORS.background} 0%, #060810 100%)`,
    "minimal-light": `linear-gradient(180deg, #1a1d25 0%, ${COLORS.background} 100%)`,
    "gradient-purple": `radial-gradient(ellipse at 50% 0%, ${COLORS.secondaryContainer}40 0%, transparent 60%),
                        linear-gradient(180deg, ${COLORS.background} 0%, #0a0510 100%)`,
  };

  return (
    <AbsoluteFill
      style={{
        background: gradients[style] || gradients["dark-tech"],
      }}
    >
      {/* 网格纹理 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `
            linear-gradient(${COLORS.onSurfaceVariant} 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.onSurfaceVariant} 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* 顶部光晕 */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}08 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />
    </AbsoluteFill>
  );
};
