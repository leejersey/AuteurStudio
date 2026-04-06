// minimal-white / Card / StepsSlide — 极简白色步骤页
import React from "react";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { StepsSlide } from "@/lib/types/card-video";

interface Props {
  data: StepsSlide;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}


export const StepsSlideComp: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.background,
        display: "flex",
        flexDirection: "column",
        padding: "80px 70px",
      }}
    >
      <h2 style={{
        fontSize: 44,
        fontWeight: 700,
        color: theme.colors.text,
        margin: "0 0 16px",
        fontFamily: theme.typography.headingFont,
        opacity: headingOpacity,
      }}>
        {data.heading}
      </h2>
      {data.subheading && (
        <p style={{ fontSize: 22, color: theme.colors.textMuted, margin: "0 0 40px", fontFamily: theme.typography.bodyFont, opacity: headingOpacity }}>
          {data.subheading}
        </p>
      )}

      {/* 垂直时间线 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1, position: "relative" }}>
        {data.steps.map((step, i) => {
          const delay = 10 + i * 10;
          const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" });
          const slideY = interpolate(frame, [delay, delay + 15], [15, 0], { extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
                paddingBottom: 32,
                opacity,
                transform: `translateY(${slideY}px)`,
              }}
            >
              {/* 时间线节点 */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: theme.colors.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: theme.typography.bodyFont,
                  }}
                >
                  {i + 1}
                </div>
                {i < data.steps.length - 1 && (
                  <div style={{ width: 2, height: 40, background: `${theme.colors.primary}20`, marginTop: 4 }} />
                )}
              </div>
              {/* 内容 */}
              <div style={{ paddingTop: 4 }}>
                <p style={{ fontSize: 26, fontWeight: 600, color: theme.colors.text, margin: 0, lineHeight: 1.4, fontFamily: theme.typography.bodyFont }}>
                  {step.action}
                </p>
                {step.note && (
                  <p style={{ fontSize: 20, color: theme.colors.textMuted, margin: "6px 0 0", fontFamily: theme.typography.bodyFont }}>
                    {step.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
