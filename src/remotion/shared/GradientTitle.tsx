import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";

interface GradientTitleProps {
  text: string;
  highlightWords?: string[];
  fontSize?: number;
  delay?: number;
}

export const GradientTitle: React.FC<GradientTitleProps> = ({
  text,
  highlightWords = [],
  fontSize,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTemplateTheme();

  const resolvedFontSize = fontSize ?? theme.typography.headingSize;

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: theme.animation.springConfig,
  });

  // 将高亮词用渐变包裹
  const renderText = () => {
    if (highlightWords.length === 0) {
      return (
        <span
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {text}
        </span>
      );
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    highlightWords.forEach((word) => {
      const index = text.indexOf(word, lastIndex);
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push(
            <span key={lastIndex} style={{ color: theme.colors.text }}>
              {text.slice(lastIndex, index)}
            </span>
          );
        }
        parts.push(
          <span
            key={index}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
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

    if (lastIndex < text.length) {
      parts.push(
        <span key={lastIndex} style={{ color: theme.colors.text }}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div
      style={{
        fontSize: resolvedFontSize,
        fontFamily: theme.typography.headingFont,
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
