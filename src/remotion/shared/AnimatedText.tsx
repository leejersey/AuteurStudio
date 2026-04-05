import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "../styles/theme";

type AnimationMode = "fadeIn" | "typewriter" | "slideUp";

interface AnimatedTextProps {
  text: string;
  mode?: AnimationMode;
  delay?: number; // 延迟帧数
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: number;
  style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  mode = "fadeIn",
  delay = 0,
  fontSize = 32,
  color = COLORS.onSurface,
  fontFamily = FONTS.body,
  fontWeight = 400,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  if (mode === "typewriter") {
    const charsToShow = Math.floor(adjustedFrame / 2); // 每2帧显示一个字符
    const displayText = text.slice(0, charsToShow);
    const opacity = interpolate(adjustedFrame, [0, 5], [0, 1], {
      extrapolateRight: "clamp",
    });

    return (
      <span
        style={{
          fontSize,
          color,
          fontFamily,
          fontWeight,
          opacity,
          ...style,
        }}
      >
        {displayText}
        {charsToShow < text.length && (
          <span
            style={{
              opacity: Math.round(adjustedFrame / 15) % 2 === 0 ? 1 : 0,
              color: COLORS.primary,
            }}
          >
            |
          </span>
        )}
      </span>
    );
  }

  if (mode === "slideUp") {
    const progress = spring({
      frame: adjustedFrame,
      fps,
      config: { damping: 20, mass: 0.8, stiffness: 100 },
    });
    const translateY = interpolate(progress, [0, 1], [40, 0]);
    const opacity = interpolate(progress, [0, 1], [0, 1]);

    return (
      <span
        style={{
          fontSize,
          color,
          fontFamily,
          fontWeight,
          opacity,
          transform: `translateY(${translateY}px)`,
          display: "inline-block",
          ...style,
        }}
      >
        {text}
      </span>
    );
  }

  // fadeIn (default)
  const opacity = interpolate(adjustedFrame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        fontSize,
        color,
        fontFamily,
        fontWeight,
        opacity,
        ...style,
      }}
    >
      {text}
    </span>
  );
};
