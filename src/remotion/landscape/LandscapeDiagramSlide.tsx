import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../styles/theme";

interface Node {
  label: string;
  icon?: string;
  description?: string;
}

interface Props {
  heading: string;
  diagramType: "flow" | "layers" | "compare";
  nodes: Node[];
  connections?: string[];
}

export const LandscapeDiagramSlide: React.FC<Props> = ({
  heading,
  diagramType,
  nodes,
}) => {
  const frame = useCurrentFrame();
  const headingOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.background} 0%, #060810 100%)`,
        display: "flex",
        flexDirection: "column",
        padding: "40px 80px 130px",
      }}
    >
      {/* 标题 */}
      <h2
        style={{
          fontSize: 42,
          fontWeight: 700,
          fontFamily: FONTS.headline,
          color: COLORS.onSurface,
          textAlign: "center",
          margin: "0 0 40px",
          opacity: headingOpacity,
        }}
      >
        {heading}
      </h2>

      {/* 图解区域 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {diagramType === "flow" && <FlowDiagram nodes={nodes} frame={frame} />}
        {diagramType === "layers" && <LayersDiagram nodes={nodes} frame={frame} />}
        {diagramType === "compare" && <CompareDiagram nodes={nodes} frame={frame} />}
      </div>
    </AbsoluteFill>
  );
};

// ─── Flow Diagram（流程图）───

const FlowDiagram: React.FC<{ nodes: Node[]; frame: number }> = ({ nodes, frame }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      {nodes.map((node, i) => {
        const delay = i * 10;
        const opacity = interpolate(frame, [10 + delay, 25 + delay], [0, 1], { extrapolateRight: "clamp" });
        const scale = interpolate(frame, [10 + delay, 25 + delay], [0.8, 1], { extrapolateRight: "clamp" });
        const arrowOpacity = interpolate(frame, [20 + delay, 30 + delay], [0, 1], { extrapolateRight: "clamp" });

        return (
          <React.Fragment key={i}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "20px 28px",
                background: `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.tertiary}10)`,
                border: `1.5px solid ${COLORS.primary}30`,
                borderRadius: 16,
                minWidth: 120,
                opacity,
                transform: `scale(${scale})`,
              }}
            >
              {node.icon && <span style={{ fontSize: 40 }}>{node.icon}</span>}
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: COLORS.onSurface,
                  textAlign: "center",
                  fontFamily: FONTS.body,
                }}
              >
                {node.label}
              </span>
              {node.description && (
                <span style={{ fontSize: 16, color: COLORS.onSurfaceVariant, textAlign: "center" }}>
                  {node.description}
                </span>
              )}
            </div>
            {i < nodes.length - 1 && (
              <span
                style={{
                  fontSize: 32,
                  color: COLORS.primary,
                  opacity: arrowOpacity,
                  fontWeight: 700,
                }}
              >
                →
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Layers Diagram（分层架构）───

const LayersDiagram: React.FC<{ nodes: Node[]; frame: number }> = ({ nodes, frame }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "80%",
        maxWidth: 800,
      }}
    >
      {nodes.map((node, i) => {
        const delay = i * 8;
        const opacity = interpolate(frame, [10 + delay, 25 + delay], [0, 1], { extrapolateRight: "clamp" });
        const x = interpolate(frame, [10 + delay, 25 + delay], [-40, 0], { extrapolateRight: "clamp" });
        const colors = [COLORS.primary, COLORS.tertiary, COLORS.secondary, "#6366f1", "#f59e0b"];
        const color = colors[i % colors.length];

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 28px",
              background: `${color}12`,
              border: `1px solid ${color}30`,
              borderRadius: 12,
              opacity,
              transform: `translateX(${x}px)`,
            }}
          >
            {node.icon && <span style={{ fontSize: 34 }}>{node.icon}</span>}
            <div>
              <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.onSurface, fontFamily: FONTS.body }}>
                {node.label}
              </span>
              {node.description && (
                <span style={{ fontSize: 18, color: COLORS.onSurfaceVariant, marginLeft: 12 }}>
                  {node.description}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Compare Diagram（对比图）───

const CompareDiagram: React.FC<{ nodes: Node[]; frame: number }> = ({ nodes, frame }) => {
  const mid = Math.ceil(nodes.length / 2);
  const left = nodes.slice(0, mid);
  const right = nodes.slice(mid);

  return (
    <div style={{ display: "flex", gap: 40, width: "85%", maxWidth: 900 }}>
      {[left, right].map((group, gi) => (
        <div key={gi} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {group.map((node, i) => {
            const delay = (gi * mid + i) * 8;
            const opacity = interpolate(frame, [10 + delay, 25 + delay], [0, 1], { extrapolateRight: "clamp" });

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 20px",
                  background: gi === 0 ? `${COLORS.primary}12` : `${COLORS.tertiary}12`,
                  border: `1px solid ${gi === 0 ? COLORS.primary : COLORS.tertiary}25`,
                  borderRadius: 12,
                  opacity,
                }}
              >
                {node.icon && <span style={{ fontSize: 32 }}>{node.icon}</span>}
                <div>
                  <span style={{ fontSize: 22, fontWeight: 600, color: COLORS.onSurface, fontFamily: FONTS.body }}>
                    {node.label}
                  </span>
                  {node.description && (
                    <p style={{ fontSize: 17, color: COLORS.onSurfaceVariant, margin: "4px 0 0" }}>
                      {node.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
