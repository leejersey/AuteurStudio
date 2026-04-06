// minimal-white / Algo / GridBoard — 极简白色算法网格
import React from "react";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { interpolate, useCurrentFrame } from "remotion";
import type { CellState } from "@/lib/types/algo-video";

interface Props {
  grid: CellState[][];
  highlights?: [number, number][];
}

const ACCENT = "#3b82f6";

const STATE_COLORS: Record<CellState["state"], { bg: string; text: string; border: string }> = {
  empty: { bg: "#f5f5f5", text: "#ccc", border: "#e5e7eb" },
  fresh: { bg: "#fff", text: "#333", border: "#e5e7eb" },
  rotten: { bg: "#fef2f2", text: "#ef4444", border: "#fca5a5" },
  just_rotten: { bg: "#fee2e2", text: "#dc2626", border: "#f87171" },
  comparing: { bg: `${ACCENT}10`, text: ACCENT, border: ACCENT },
  swapped: { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" },
  sorted: { bg: "#ecfdf5", text: "#059669", border: "#6ee7b7" },
  active: { bg: `${ACCENT}15`, text: ACCENT, border: ACCENT },
};

export const GridBoard: React.FC<Props> = ({ grid, highlights }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const boardOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  if (!grid.length) return null;
  const rows = grid.length;
  const cols = grid[0].length;
  const cellSize = Math.min(80, Math.floor(900 / cols), Math.floor(500 / rows));
  const gap = 6;

  const isHighlight = (r: number, c: number) =>
    highlights?.some(([hr, hc]) => hr === r && hc === c) ?? false;

  return (
    <div style={{
      position: "absolute",
      top: 120,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      opacity: boardOpacity,
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gap,
        padding: 24,
        background: "#fff",
        borderRadius: 20,
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        {grid.flat().map((cell, idx) => {
          const r = Math.floor(idx / cols);
          const c = idx % cols;
          const hl = isHighlight(r, c);
          const colors = STATE_COLORS[cell.state];

          return (
            <div
              key={idx}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 10,
                background: colors.bg,
                border: `2px solid ${hl ? ACCENT : colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: cellSize * 0.4,
                fontWeight: 700,
                color: colors.text,
                fontFamily: "'Inter', sans-serif",
                boxShadow: hl ? `0 0 12px ${ACCENT}25` : "none",
                transition: "all 0.2s",
              }}
            >
              {cell.state !== "empty" ? cell.value : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
};
