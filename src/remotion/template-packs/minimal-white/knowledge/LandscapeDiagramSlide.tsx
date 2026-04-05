// minimal-white / Knowledge / LandscapeDiagramSlide
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  heading: string;
  diagramType: "flow" | "layers" | "compare";
  nodes: { label: string; icon?: string; description?: string }[];
  connections?: string[];
}

const ACCENT = "#3b82f6";

export const LandscapeDiagramSlide: React.FC<Props> = ({ heading, diagramType, nodes }) => {
  const frame = useCurrentFrame();
  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const isFlow = diagramType === "flow";

  return (
    <AbsoluteFill
      style={{
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        padding: "70px 100px",
      }}
    >
      <h2 style={{
        fontSize: 44,
        fontWeight: 700,
        color: "#1a1a1a",
        margin: "0 0 50px",
        fontFamily: "'Noto Serif SC', serif",
        opacity: headingOpacity,
      }}>
        {heading}
      </h2>

      <div style={{
        display: "flex",
        flexDirection: isFlow ? "row" : "column",
        alignItems: isFlow ? "center" : "stretch",
        justifyContent: "center",
        gap: isFlow ? 12 : 16,
        flex: 1,
      }}>
        {nodes.map((node, i) => {
          const delay = 10 + i * 8;
          const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" });
          const scale = interpolate(frame, [delay, delay + 15], [0.9, 1], { extrapolateRight: "clamp" });

          return (
            <React.Fragment key={i}>
              <div
                style={{
                  padding: "24px 32px",
                  background: "#fff",
                  borderRadius: 16,
                  border: `1px solid ${ACCENT}20`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  textAlign: "center",
                  opacity,
                  transform: `scale(${scale})`,
                  flex: isFlow ? 1 : undefined,
                  minWidth: isFlow ? 200 : undefined,
                }}
              >
                {node.icon && <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>{node.icon}</span>}
                <p style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                  {node.label}
                </p>
                {node.description && (
                  <p style={{ fontSize: 16, color: "#888", margin: "6px 0 0", fontFamily: "'Inter', sans-serif" }}>
                    {node.description}
                  </p>
                )}
              </div>
              {isFlow && i < nodes.length - 1 && (
                <div style={{
                  fontSize: 24,
                  color: ACCENT,
                  opacity: interpolate(frame, [delay + 8, delay + 18], [0, 1], { extrapolateRight: "clamp" }),
                  fontFamily: "'Inter', sans-serif",
                }}>
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
