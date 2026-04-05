import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles/theme";

interface GradientTitleProps {
  text: string;
  highlightWords?: string[];
  fontSize?: number;
  delay?: number;
}

export const GradientTitle: React.FC<GradientTitleProps> = ({
  text,
  highlightWords = [],
  fontSize = 72,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 15, mass: 1, stiffness: 80 },
  });

  // 将高亮词用渐变包裹
  const renderText = () => {
    if (highlightWords.length === 0) {
      return (
        <span
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {text}
        </span>
      );
    }

    let result = text;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    highlightWords.forEach((word) => {
      const index = result.indexOf(word, lastIndex);
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push(
            <span key={lastIndex} style={{ color: COLORS.onSurface }}>
              {result.slice(lastIndex, index)}
            </span>
          );
        }
        parts.push(
          <span
            key={index}
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {word}
          </span>
        );
        lastIndex = index + word.length;
      }
    });

    if (lastIndex < result.length) {
      parts.push(
        <span key={lastIndex} style={{ color: COLORS.onSurface }}>
          {result.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div
      style={{
        fontSize,
        fontFamily: FONTS.headline,
        fontWeight: 800,
        lineHeight: 1.2,
        transform: `translateY(${(1 - progress) * 30}px)`,
        opacity: progress,
      }}
    >
      {renderText()}
    </div>
  );
};
