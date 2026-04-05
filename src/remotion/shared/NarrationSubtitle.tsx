// remotion/shared/NarrationSubtitle.tsx — 旁白字幕层（共享组件）
// 从 algo/NarrationSubtitle.tsx 提升到 shared/ 供所有模板复用
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../styles/theme";
import type { NarrationSegment } from "@/lib/types/algo-video";

interface NarrationSubtitleProps {
  segment: NarrationSegment;
}

export const NarrationSubtitle: React.FC<NarrationSubtitleProps> = ({
  segment,
}) => {
  const frame = useCurrentFrame();

  // 从底部滑入
  const slideUp = interpolate(frame, [0, 12], [20, 0], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  // 基于字幕时间戳的逐词高亮
  const currentTimeMs = (frame / 30) * 1000;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: 80,
        right: 80,
        padding: "16px 28px",
        background: `${COLORS.surfaceHigh}90`,
        backdropFilter: "blur(20px)",
        borderRadius: 14,
        border: `1px solid ${COLORS.outlineVariant}15`,
        transform: `translateY(${slideUp}px)`,
        opacity,
      }}
    >
      {segment.timestamps ? (
        // 逐词高亮模式
        <p
          style={{
            fontSize: 28,
            fontFamily: FONTS.body,
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
                    ? COLORS.primary
                    : isPast
                      ? COLORS.onSurface
                      : `${COLORS.onSurface}60`,
                  fontWeight: isActive ? 700 : 500,
                  transition: "color 0.15s ease",
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
            fontFamily: FONTS.body,
            fontStyle: "italic",
            lineHeight: 1.5,
            fontWeight: 500,
            color: COLORS.onSurface,
            margin: 0,
          }}
        >
          &ldquo;{segment.text}&rdquo;
        </p>
      )}
    </div>
  );
};
