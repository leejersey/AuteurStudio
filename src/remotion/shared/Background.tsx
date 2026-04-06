import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

interface BackgroundProps {
  /** 可选的背景图 URL (来自 Unsplash) */
  imageUrl?: string;
  /** 图片来源归属 */
  imageCredit?: string;
}

export const Background: React.FC<BackgroundProps> = ({ imageUrl, imageCredit }) => {
  const theme = useTemplateTheme();
  const { colors, decoration } = theme;
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const gradients: Record<string, string> = {
    "dark-radial": `radial-gradient(ellipse at 20% 80%, ${colors.primary}15 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 20%, ${colors.secondary}10 0%, transparent 50%),
                    linear-gradient(180deg, ${colors.background} 0%, #060810 100%)`,
    "light-flat": `linear-gradient(180deg, ${colors.background} 0%, ${colors.surfaceHigh} 100%)`,
    gradient: `radial-gradient(ellipse at 50% 0%, ${colors.secondaryDim}40 0%, transparent 60%),
               linear-gradient(180deg, ${colors.background} 0%, #0a0510 100%)`,
  };

  // Ken Burns 效果参数
  const progress = durationInFrames > 0 ? frame / durationInFrames : 0;
  const imgScale = 1 + progress * 0.05;
  const imgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          gradients[decoration.backgroundStyle] || gradients["dark-radial"],
      }}
    >
      {/* 图片背景层 */}
      {imageUrl && (
        <AbsoluteFill style={{ overflow: "hidden", opacity: imgOpacity * 0.35 }}>
          <Img
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${imgScale})`,
              filter: "blur(30px) saturate(1.4)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* 图片遮罩 — 让图片只提供微妙的色彩氛围 */}
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, 
              ${colors.background}e8 0%, 
              ${colors.background}c8 40%, 
              ${colors.background}dd 100%)`,
          }}
        />
      )}

      {/* 网格纹理 */}
      {decoration.showGrid && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: decoration.gridOpacity,
            backgroundImage: `
              linear-gradient(${colors.textMuted} 1px, transparent 1px),
              linear-gradient(90deg, ${colors.textMuted} 1px, transparent 1px)
            `,
            backgroundSize: `${decoration.gridSize}px ${decoration.gridSize}px`,
          }}
        />
      )}
      {/* 顶部光晕 */}
      {decoration.showGlow && (
        <div
          style={{
            position: "absolute",
            top: -200,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.primary}${Math.round(
              decoration.glowIntensity * 15
            )
              .toString(16)
              .padStart(2, "0")} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
      )}

      {/* 图片来源归属 */}
      {imageUrl && imageCredit && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 12,
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "Inter, system-ui, sans-serif",
            zIndex: 10,
          }}
        >
          📷 {imageCredit}
        </div>
      )}
    </AbsoluteFill>
  );
};
