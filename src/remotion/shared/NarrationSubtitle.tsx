// remotion/shared/NarrationSubtitle.tsx — 旁白字幕层（共享组件）
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../TemplateThemeContext";
import type { NarrationSegment } from "@/lib/types/algo-video";

interface NarrationSubtitleProps {
  segment: NarrationSegment;
}

export const NarrationSubtitle: React.FC<NarrationSubtitleProps> = ({
  segment,
}) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();

  // 从底部滑入
  const slideUp = interpolate(frame, [0, 12], [20, 0], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  const currentTimeMs = (frame / 30) * 1000;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: "50%",
        transform: `translate(-50%, ${slideUp}px)`, // 居中 + 动画
        padding: "20px 44px",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(32px)",
        borderRadius: 50,
        border: `1px solid rgba(255, 255, 255, 0.12)`,
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        opacity,
        maxWidth: "85%",
        textAlign: "center",
      }}
    >
      {segment.timestamps ? (
        // 逐词高亮模式
        <p
          style={{
            fontSize: 28,
            fontFamily: theme.typography.bodyFont,
            fontStyle: "italic",
            lineHeight: 1.5,
            fontWeight: 500,
            margin: 0,
          }}
        >
          &ldquo;
          {segment.timestamps.map((ts, i) => {
            const isActive =
              currentTimeMs >= ts.startMs && currentTimeMs < ts.endMs;
            const isPast = currentTimeMs >= ts.endMs;

            return (
              <span
                key={i}
                style={{
                  color: isActive
                    ? theme.colors.primary
                    : isPast
                      ? theme.colors.text
                      : `${theme.colors.text}60`,
                  fontWeight: isActive ? 800 : 500,
                  display: "inline-block",
                  transform: isActive ? "scale(1.05) translateY(-2px)" : "scale(1) translateY(0)",
                  textShadow: isActive ? `0 0 20px ${theme.colors.primary}80` : "none",
                  transition: "color 0.2s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), text-shadow 0.2s ease",
                  margin: "0 2px",
                }}
              >
                {ts.word}
              </span>
            );
          })}
          &rdquo;
        </p>
      ) : (
        // 普通文字模式
        <p
          style={{
            fontSize: 28,
            fontFamily: theme.typography.bodyFont,
            fontStyle: "italic",
            lineHeight: 1.5,
            fontWeight: 500,
            color: theme.colors.text,
            margin: 0,
          }}
        >
          &ldquo;{segment.text}&rdquo;
        </p>
      )}
    </div>
  );
};
