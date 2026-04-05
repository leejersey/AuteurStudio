// remotion/algo/StepIndicator.tsx — 步骤进度指示器（Remotion 内部组件）
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../styles/theme";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  annotation?: string;
  description: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  annotation,
  description,
}) => {
  const frame = useCurrentFrame();

  const slideIn = interpolate(frame, [5, 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 140,
        right: 60,
        width: 360,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        transform: `translateX(${slideIn}px)`,
        opacity,
      }}
    >
      {/* 步骤进度 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            style={{
              width: i === currentStep ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i <= currentStep ? COLORS.primary : COLORS.outlineVariant,
              transition: "all 0.3s ease",
            }}
          />
        ))}
        <span
          style={{
            fontSize: 12,
            color: COLORS.onSurfaceVariant,
            fontFamily: FONTS.body,
            marginLeft: 8,
          }}
        >
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* 标注 */}
      {annotation && (
        <div
          style={{
            padding: "12px 20px",
            background: `${COLORS.surfaceHigh}80`,
            borderRadius: 10,
            borderLeft: `3px solid ${COLORS.primary}`,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: COLORS.primary,
            }}
          >
            {annotation}
          </span>
        </div>
      )}

      {/* 步骤描述 */}
      <div
        style={{
          padding: "16px 20px",
          background: `${COLORS.surface}90`,
          borderRadius: 10,
          border: `1px solid ${COLORS.outlineVariant}20`,
        }}
      >
        <span
          style={{
            fontSize: 20,
            color: COLORS.onSurface,
            fontFamily: FONTS.body,
            lineHeight: 1.6,
          }}
        >
          {description}
        </span>
      </div>
    </div>
  );
};
