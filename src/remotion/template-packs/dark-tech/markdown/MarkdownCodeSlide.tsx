// Markdown 代码页 Slide — 语法高亮 + 逐行打字机动画
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { CODE_THEMES, tokenizeLine } from "./codeThemes";
import type { CodeTheme } from "@/lib/types/markdown-video";

interface Props {
  heading: string;
  language: string;
  lines: string[];
  highlightLines?: number[];
  theme: CodeTheme;
  durationInFrames: number;
}

export const MarkdownCodeSlide: React.FC<Props> = ({
  heading,
  language,
  lines,
  highlightLines = [],
  theme: themeName,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const themeColors = CODE_THEMES[themeName] || CODE_THEMES.dracula;

  // 逐行打字机效果：80% 时间用于"打字"，20% 时间展示完整代码
  const typingEndFrame = durationInFrames * 0.8;
  const totalLines = lines.length;

  const visibleLineCount = Math.min(
    totalLines,
    Math.floor(
      interpolate(frame, [10, typingEndFrame], [0, totalLines], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  // 当前正在"打字"的行的进度
  const currentLineProgress =
    visibleLineCount < totalLines
      ? interpolate(
          frame,
          [10, typingEndFrame],
          [0, totalLines],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        ) % 1
      : 1;

  // 标题动画
  const headingOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // 编辑器窗口动画
  const editorScale = interpolate(frame, [0, 15], [0.95, 1], { extrapolateRight: "clamp" });
  const editorOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // 光标闪烁
  const cursorOpacity = Math.sin(frame * 0.3) > 0 ? 1 : 0;

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.background,
        fontFamily: theme.typography.bodyFont,
        padding: "60px 80px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 标题行 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          opacity: headingOpacity,
        }}
      >
        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            fontFamily: theme.typography.headingFont,
            color: theme.colors.text,
            margin: 0,
          }}
        >
          {heading}
        </h2>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: themeColors.keyword,
            background: `${themeColors.keyword}15`,
            padding: "4px 14px",
            borderRadius: 6,
            fontFamily: theme.typography.monoFont,
          }}
        >
          {language}
        </span>
      </div>

      {/* 代码编辑器窗口 */}
      <div
        style={{
          flex: 1,
          borderRadius: 16,
          overflow: "hidden",
          transform: `scale(${editorScale})`,
          opacity: editorOpacity,
          boxShadow: `0 20px 80px ${themeColors.background}60`,
          border: `1px solid ${theme.colors.borderSubtle}30`,
        }}
      >
        {/* 窗口标题栏 */}
        <div
          style={{
            background: themeColors.headerBg,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: themeColors.headerDot1 }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: themeColors.headerDot2 }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: themeColors.headerDot3 }} />
          <span
            style={{
              marginLeft: 12,
              fontSize: 13,
              color: themeColors.headerText,
              fontFamily: theme.typography.monoFont,
            }}
          >
            {heading.toLowerCase().replace(/\s+/g, "_")}.{language}
          </span>
        </div>

        {/* 代码区域 */}
        <div
          style={{
            background: themeColors.background,
            padding: "20px 0",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {lines.map((line, i) => {
            const isVisible = i < visibleLineCount;
            const isCurrentLine = i === visibleLineCount;
            const isHighlighted = highlightLines.includes(i + 1);

            // 未显示的行不渲染
            if (!isVisible && !isCurrentLine) return null;

            const tokens = tokenizeLine(line, themeColors);
            const displayText = isCurrentLine
              ? line.slice(0, Math.floor(line.length * currentLineProgress))
              : line;
            const displayTokens = isCurrentLine
              ? tokenizeLine(displayText, themeColors)
              : tokens;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  fontFamily: theme.typography.monoFont,
                  fontSize: 20,
                  lineHeight: 1.8,
                  padding: "0 24px",
                  background: isHighlighted
                    ? `${themeColors.keyword}15`
                    : isCurrentLine
                    ? `${themeColors.foreground}08`
                    : "transparent",
                  borderLeft: isHighlighted
                    ? `3px solid ${themeColors.keyword}`
                    : "3px solid transparent",
                }}
              >
                {/* 行号 */}
                <span
                  style={{
                    minWidth: 48,
                    textAlign: "right",
                    paddingRight: 20,
                    color: isCurrentLine
                      ? themeColors.lineNumberActive
                      : themeColors.lineNumber,
                    userSelect: "none",
                    fontWeight: isCurrentLine ? 700 : 400,
                  }}
                >
                  {i + 1}
                </span>

                {/* 代码内容 */}
                <span>
                  {displayTokens.map((token, j) => (
                    <span key={j} style={{ color: token.color }}>
                      {token.text}
                    </span>
                  ))}
                  {/* 光标 */}
                  {isCurrentLine && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: 22,
                        background: themeColors.cursor,
                        marginLeft: 1,
                        opacity: cursorOpacity,
                        verticalAlign: "text-bottom",
                      }}
                    />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
