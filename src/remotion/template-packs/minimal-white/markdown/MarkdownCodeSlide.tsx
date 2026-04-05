// minimal-white / Markdown / MarkdownCodeSlide — 代码展示页（浅色主题）
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { CodeTheme } from "@/lib/types/markdown-video";

interface Props {
  heading: string;
  language: string;
  lines: string[];
  highlightLines?: number[];
  theme: CodeTheme;
  durationInFrames: number;
}

const ACCENT = "#3b82f6";

export const MarkdownCodeSlide: React.FC<Props> = ({ heading, language, lines, highlightLines, durationInFrames }) => {
  const frame = useCurrentFrame();
  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // 逐行显示效果
  const totalLines = lines.length;
  const lineAppearFrames = Math.min(durationInFrames * 0.6, totalLines * 4);

  return (
    <AbsoluteFill style={{ background: "#fafafa", display: "flex", flexDirection: "column", padding: "60px 100px" }}>
      {/* 标题 + 语言标签 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, opacity: headingOpacity }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, color: "#1a1a1a", margin: 0, fontFamily: "'Noto Serif SC', serif" }}>
          {heading}
        </h2>
        <span style={{ padding: "4px 14px", background: `${ACCENT}10`, border: `1px solid ${ACCENT}20`, borderRadius: 8, fontSize: 14, fontWeight: 600, color: ACCENT, fontFamily: "'Inter', sans-serif", textTransform: "uppercase" }}>
          {language}
        </span>
      </div>

      {/* 代码块 — 浅色风格 */}
      <div style={{
        flex: 1,
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        padding: "28px 32px",
        overflow: "hidden",
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        fontSize: 20,
        lineHeight: 1.8,
      }}>
        {lines.map((line, i) => {
          const lineDelay = 10 + (i / totalLines) * lineAppearFrames;
          const lineOpacity = interpolate(frame, [lineDelay, lineDelay + 6], [0, 1], { extrapolateRight: "clamp" });
          const isHighlight = highlightLines?.includes(i + 1);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                opacity: lineOpacity,
                background: isHighlight ? `${ACCENT}08` : "transparent",
                borderLeft: isHighlight ? `3px solid ${ACCENT}` : "3px solid transparent",
                padding: "2px 12px",
                borderRadius: 4,
              }}
            >
              <span style={{ width: 40, color: "#ccc", flexShrink: 0, userSelect: "none", textAlign: "right", marginRight: 16 }}>
                {i + 1}
              </span>
              <span style={{ color: "#333", whiteSpace: "pre" }}>{line || " "}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
