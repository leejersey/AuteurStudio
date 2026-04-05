// minimal-white / Card / TitleSlide — 极简白色标题页
// 布局：左对齐，大号衬线体，极简留白
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { TitleSlide } from "@/lib/types/card-video";

interface Props {
  data: TitleSlide;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

const ACCENT = "#3b82f6";

export const TitleSlideComp: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const titleX = interpolate(frame, [0, 25], [-30, 0], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [10, 30], [0, 120], { extrapolateRight: "clamp" });
  const catOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "100px 80px",
      }}
    >
      {/* 分类标签 */}
      <div
        style={{
          opacity: catOpacity,
          fontSize: 18,
          fontWeight: 600,
          color: ACCENT,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 24,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {data.category}
      </div>

      {/* 主标题 */}
      <h1
        style={{
          fontSize: 84,
          fontWeight: 800,
          color: "#1a1a1a",
          lineHeight: 1.15,
          margin: 0,
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
          fontFamily: "'Noto Serif SC', serif",
          maxWidth: 800,
        }}
      >
        {data.heading}
      </h1>

      {/* 装饰线 */}
      <div
        style={{
          width: lineW,
          height: 4,
          background: ACCENT,
          borderRadius: 2,
          marginTop: 40,
          marginBottom: 30,
        }}
      />

      {/* 副标题 */}
      <p
        style={{
          fontSize: 28,
          fontWeight: 400,
          color: "#666",
          opacity: subtitleOpacity,
          margin: 0,
          fontFamily: "'Inter', sans-serif",
          maxWidth: 600,
          lineHeight: 1.6,
        }}
      >
        {data.subtitle}
      </p>

      {/* 右下角装饰 */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 80,
          width: 60,
          height: 60,
          border: `3px solid ${ACCENT}20`,
          borderRadius: 12,
          opacity: catOpacity,
        }}
      />
    </AbsoluteFill>
  );
};
