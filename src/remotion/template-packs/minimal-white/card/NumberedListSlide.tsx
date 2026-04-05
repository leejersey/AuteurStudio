// minimal-white / Card / NumberedListSlide — 极简白色列表页
// 布局：左对齐卡片式布局，淡蓝色序号圆圈
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { NumberedListSlide } from "@/lib/types/card-video";

interface Props {
  data: NumberedListSlide;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

const ACCENT = "#3b82f6";

export const NumberedListSlideComp: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        padding: "80px 70px",
      }}
    >
      {/* 标题 */}
      {data.heading && (
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#1a1a1a",
            margin: "0 0 50px 0",
            fontFamily: "'Noto Serif SC', serif",
            opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {data.heading}
        </h2>
      )}

      {/* 卡片式列表 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
        {data.items.map((item, i) => {
          const delay = 10 + i * 8;
          const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" });
          const slideX = interpolate(frame, [delay, delay + 15], [20, 0], { extrapolateRight: "clamp" });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                padding: "24px 28px",
                background: "#fff",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                opacity,
                transform: `translateX(${slideX}px)`,
              }}
            >
              {/* 序号 */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: `${ACCENT}12`,
                  border: `2px solid ${ACCENT}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 700, color: ACCENT, fontFamily: "'Inter', sans-serif" }}>
                  {i + 1}
                </span>
              </div>
              {/* 内容 */}
              <div>
                <p style={{ fontSize: 26, fontWeight: 600, color: "#1a1a1a", margin: 0, lineHeight: 1.4, fontFamily: "'Inter', sans-serif" }}>
                  {item.text}
                </p>
                {item.detail && (
                  <p style={{ fontSize: 20, color: "#888", margin: "8px 0 0", lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                    {item.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 标签 */}
      {data.tags && data.tags.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
          {data.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                padding: "6px 16px",
                background: `${ACCENT}10`,
                border: `1px solid ${ACCENT}25`,
                borderRadius: 20,
                fontSize: 16,
                fontWeight: 600,
                color: ACCENT,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
