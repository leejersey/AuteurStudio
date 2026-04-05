// remotion/algo/GridBoard.tsx — 通用数据面板（Remotion 内部组件）
// 支持：排序算法（一维数组横排）、矩阵算法（二维网格）
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../styles/theme";
import type { CellState } from "@/lib/types/algo-video";

interface GridBoardProps {
  grid: CellState[][];
  highlights?: [number, number][];
  cellSize?: number;
  cellGap?: number;
}

// 根据 state 返回样式
const getCellStyle = (state: string) => {
  switch (state) {
    case "empty":
      return { bg: "#1c202820", border: "#45484f30", text: "#a9abb330" };
    case "fresh":
      return { bg: "#1c2028", border: "#45484f", text: "#e2e4e9" };
    case "comparing":
      return { bg: `${COLORS.primary}20`, border: COLORS.primary, text: COLORS.primary };
    case "swapped":
    case "just_rotten":
      return { bg: "#ff980020", border: "#ff9800", text: "#ff9800" };
    case "active":
      return { bg: `${COLORS.tertiary}20`, border: COLORS.tertiary, text: COLORS.tertiary };
    case "sorted":
    case "rotten":
      return { bg: `${COLORS.secondary}20`, border: COLORS.secondary, text: COLORS.secondary };
    default:
      return { bg: "#1c2028", border: "#45484f", text: "#e2e4e9" };
  }
};

export const GridBoard: React.FC<GridBoardProps> = ({
  grid,
  highlights,
  cellSize,
  cellGap = 8,
}) => {
  const frame = useCurrentFrame();

  // 判断是否为一维布局（排序算法）
  const is1D = grid.length === 1;
  const totalCols = grid[0]?.length || 0;

  // 自动计算 cellSize：一维时让元素占满宽度
  const autoSize = cellSize
    ? cellSize
    : is1D
      ? Math.min(120, Math.floor((1600 - 120) / Math.max(totalCols, 1)))
      : 80;

  // 整体淡入
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: is1D ? "45%" : "50%",
        left: "50%",
        transform: is1D ? "translate(-50%, -50%)" : "translate(-60%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: cellGap,
        opacity,
      }}
    >
      {/* 一维模式下显示索引行 */}
      {is1D && (
        <div style={{ display: "flex", gap: cellGap }}>
          {grid[0].map((_, c) => (
            <div
              key={`idx-${c}`}
              style={{
                width: autoSize,
                textAlign: "center",
                fontSize: 14,
                fontFamily: FONTS.mono,
                color: COLORS.onSurfaceVariant,
                opacity: 0.5,
              }}
            >
              [{c}]
            </div>
          ))}
        </div>
      )}

      {grid.map((row, r) => (
        <div key={r} style={{ display: "flex", gap: cellGap }}>
          {row.map((cell, c) => {
            const style = getCellStyle(cell.state);
            const isHighlight = highlights?.some(
              ([hr, hc]) => hr === r && hc === c
            );

            // 高亮格子的脉动效果
            const scale = isHighlight
              ? interpolate(frame % 30, [0, 15, 30], [1, 1.08, 1], {
                  extrapolateRight: "clamp",
                })
              : 1;

            // 进入动画（按列错开）
            const enterDelay = c * 2;
            const cellOpacity = interpolate(
              frame,
              [enterDelay, enterDelay + 8],
              [0, 1],
              { extrapolateRight: "clamp" }
            );
            const slideUp = interpolate(
              frame,
              [enterDelay, enterDelay + 8],
              [20, 0],
              { extrapolateRight: "clamp" }
            );

            return (
              <div
                key={c}
                style={{
                  width: autoSize,
                  height: autoSize,
                  borderRadius: is1D ? 14 : 10,
                  background: isHighlight ? `${COLORS.primary}15` : style.bg,
                  border: `2px solid ${isHighlight ? COLORS.primary : style.border}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isHighlight
                    ? `0 0 24px ${COLORS.primary}40`
                    : "none",
                  transform: `scale(${scale}) translateY(${slideUp}px)`,
                  opacity: cellOpacity,
                }}
              >
                {cell.state !== "empty" && (
                  <span
                    style={{
                      fontSize: is1D ? Math.min(36, autoSize * 0.4) : 28,
                      fontWeight: 700,
                      fontFamily: FONTS.headline,
                      color: isHighlight ? COLORS.primary : style.text,
                    }}
                  >
                    {cell.value}
                  </span>
                )}

                {/* 状态标签（仅高亮/特殊状态时显示） */}
                {(cell.state === "comparing" || cell.state === "swapped" || cell.state === "sorted") && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: FONTS.mono,
                      color: style.text,
                      marginTop: 2,
                      opacity: 0.8,
                      letterSpacing: 1,
                    }}
                  >
                    {cell.state === "comparing" && "比较"}
                    {cell.state === "swapped" && "交换"}
                    {cell.state === "sorted" && "✓"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
