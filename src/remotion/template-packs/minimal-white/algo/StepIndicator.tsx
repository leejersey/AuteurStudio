// minimal-white / Algo / StepIndicator
import React from "react";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { interpolate, useCurrentFrame } from "remotion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  annotation?: string;
  description: string;
}

const ACCENT = "#3b82f6";

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps, annotation, description }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      bottom: 160,
      left: 100,
      right: 100,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      opacity,
    }}>
      {/* 步骤指示器 */}
      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{
            height: 4,
            flex: 1,
            borderRadius: 2,
            background: i <= currentStep ? ACCENT : "#e5e7eb",
            transition: "background 0.3s",
          }} />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 22, fontWeight: 600, color: "#333", margin: 0, fontFamily: "'Inter', sans-serif" }}>
            {description}
          </p>
          {annotation && (
            <span style={{ fontSize: 16, color: ACCENT, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
              {annotation}
            </span>
          )}
        </div>
        <span style={{ fontSize: 16, color: "#999", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
          {currentStep + 1} / {totalSteps}
        </span>
      </div>
    </div>
  );
};
