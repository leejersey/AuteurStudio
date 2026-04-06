import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

type AnimationMode = "fadeIn" | "typewriter" | "slideUp" | "scaleIn";

interface AnimatedTextProps {
  text: string;
  mode?: AnimationMode;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: number;
  style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  mode,
  delay = 0,
  fontSize,
  color,
  fontFamily,
  fontWeight = 400,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTemplateTheme();
  const adjustedFrame = Math.max(0, frame - delay);

  // 使用传入值或 theme 默认值
  const resolvedColor = color ?? theme.colors.text;
  const resolvedFont = fontFamily ?? theme.typography.bodyFont;
  const resolvedSize = fontSize ?? theme.typography.bodySize;
  const resolvedMode = mode ?? theme.animation.entryEffect;

  if (resolvedMode === "typewriter") {
    const charsToShow = Math.floor(adjustedFrame / 2);
    const displayText = text.slice(0, charsToShow);
    const opacity = interpolate(adjustedFrame, [0, 5], [0, 1], {
      extrapolateRight: "clamp",
    });

    return (
      <span
        style={{
          fontSize: resolvedSize,
          color: resolvedColor,
          fontFamily: resolvedFont,
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
              color: theme.colors.primary,
            }}
          >
            |
          </span>
        )}
      </span>
    );
  }

  if (resolvedMode === "slideUp") {
    const progress = spring({
      frame: adjustedFrame,
      fps,
      config: theme.animation.springConfig,
    });
    const translateY = interpolate(progress, [0, 1], [40, 0]);
    const opacity = interpolate(progress, [0, 1], [0, 1]);

    return (
      <span
        style={{
          fontSize: resolvedSize,
          color: resolvedColor,
          fontFamily: resolvedFont,
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

  if (resolvedMode === "scaleIn") {
    const progress = spring({
      frame: adjustedFrame,
      fps,
      config: theme.animation.springConfig,
    });
    return (
      <span
        style={{
          fontSize: resolvedSize,
          color: resolvedColor,
          fontFamily: resolvedFont,
          fontWeight,
          opacity: progress,
          transform: `scale(${0.8 + progress * 0.2})`,
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
        fontSize: resolvedSize,
        color: resolvedColor,
        fontFamily: resolvedFont,
        fontWeight,
        opacity,
        ...style,
      }}
    >
      {text}
    </span>
  );
};
