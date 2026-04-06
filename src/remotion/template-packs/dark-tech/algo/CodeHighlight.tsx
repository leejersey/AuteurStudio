// remotion/algo/CodeHighlight.tsx — 代码高亮展示（Remotion 内部组件）
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useTemplateTheme } from "../../../TemplateThemeContext";

interface CodeLine {
  text: string;
  indent: number;
}

interface CodeHighlightProps {
  lines?: CodeLine[];
  highlightLine?: number;
  language?: string;
}

// 默认 BFS 伪代码
const DEFAULT_LINES: CodeLine[] = [
  { text: "while queue:", indent: 0 },
  { text: "for _ in range(len(queue)):", indent: 1 },
  { text: "r, c = queue.popleft()", indent: 2 },
  { text: "for dr, dc in directions:", indent: 2 },
  { text: "nr, nc = r + dr, c + dc", indent: 3 },
  { text: "if valid(nr, nc) and grid[nr][nc] == 1:", indent: 3 },
  { text: "grid[nr][nc] = 2", indent: 4 },
  { text: "queue.append((nr, nc))", indent: 4 },
  { text: "time += 1", indent: 1 },
];

export const CodeHighlight: React.FC<CodeHighlightProps> = ({
  lines = DEFAULT_LINES,
  highlightLine,
  language = "Python",
}) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();

  const opacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 160,
        right: 60,
        width: 400,
        opacity,
        background: theme.colors.surface,
        borderRadius: 12,
        border: `1px solid ${theme.colors.borderSubtle}20`,
        overflow: "hidden",
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          borderBottom: `1px solid ${theme.colors.borderSubtle}15`,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: theme.colors.secondary,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          算法实现
        </span>
        <span
          style={{
            fontSize: 10,
            color: theme.colors.textMuted,
            background: theme.colors.surfaceHigh,
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          {language}
        </span>
      </div>

      {/* 代码区域 */}
      <div style={{ padding: "12px 16px" }}>
        {lines.map((line, i) => {
          const isHighlighted = highlightLine === i;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                fontFamily: theme.typography.monoFont,
                fontSize: 12,
                lineHeight: 2,
                paddingLeft: line.indent * 16,
                background: isHighlighted ? `${theme.colors.primary}15` : "transparent",
                borderLeft: isHighlighted ? `2px solid ${theme.colors.primary}` : "2px solid transparent",
                marginLeft: -4,
                paddingRight: 8,
              }}
            >
              <span
                style={{
                  minWidth: 24,
                  color: isHighlighted ? theme.colors.primary : `${theme.colors.textMuted}40`,
                  fontWeight: isHighlighted ? 700 : 400,
                  userSelect: "none",
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  color: isHighlighted ? theme.colors.primary : theme.colors.textMuted,
                  fontWeight: isHighlighted ? 600 : 400,
                }}
              >
                {line.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
