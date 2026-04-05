// minimal-white / Card / StepsSlide — 极简白色步骤页
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { StepsSlide } from "@/lib/types/card-video";

interface Props {
  data: StepsSlide;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

const ACCENT = "#3b82f6";

export const StepsSlideComp: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        padding: "80px 70px",
      }}
    >
      <h2 style={{
        fontSize: 44,
        fontWeight: 700,
        color: "#1a1a1a",
        margin: "0 0 16px",
        fontFamily: "'Noto Serif SC', serif",
        opacity: headingOpacity,
      }}>
        {data.heading}
      </h2>
      {data.subheading && (
        <p style={{ fontSize: 22, color: "#888", margin: "0 0 40px", fontFamily: "'Inter', sans-serif", opacity: headingOpacity }}>
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
                    background: ACCENT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {i + 1}
                </div>
                {i < data.steps.length - 1 && (
                  <div style={{ width: 2, height: 40, background: `${ACCENT}20`, marginTop: 4 }} />
                )}
              </div>
              {/* 内容 */}
              <div style={{ paddingTop: 4 }}>
                <p style={{ fontSize: 26, fontWeight: 600, color: "#1a1a1a", margin: 0, lineHeight: 1.4, fontFamily: "'Inter', sans-serif" }}>
                  {step.action}
                </p>
                {step.note && (
                  <p style={{ fontSize: 20, color: "#888", margin: "6px 0 0", fontFamily: "'Inter', sans-serif" }}>
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
