// minimal-white / Card / EndingSlide — 极简白色结尾页
import React from "react";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { EndingSlide } from "@/lib/types/card-video";

interface Props {
  data: EndingSlide;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}


export const EndingSlideComp: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const theme = useTemplateTheme();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const scaleIn = interpolate(frame, [0, 20], [0.95, 1], { extrapolateRight: "clamp" });
  const ctaOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.background,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "100px 80px",
        textAlign: "center",
      }}
    >
      {/* 头像 */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.primary}40)`,
          border: `2px solid ${theme.colors.primary}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          opacity,
          transform: `scale(${scaleIn})`,
        }}
      >
        <span style={{ fontSize: 32, fontWeight: 700, color: theme.colors.primary, fontFamily: theme.typography.bodyFont }}>
          {data.authorName.charAt(0)}
        </span>
      </div>

      {/* 作者名 */}
      <p
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: theme.colors.text,
          margin: "0 0 12px",
          fontFamily: theme.typography.bodyFont,
          opacity,
        }}
      >
        {data.authorName}
      </p>

      {/* 分割线 */}
      <div
        style={{
          width: 60,
          height: 2,
          background: "#ddd",
          marginBottom: 30,
          opacity,
        }}
      />

      {/* CTA */}
      <p
        style={{
          fontSize: 32,
          fontWeight: 500,
          color: "#444",
          margin: 0,
          fontFamily: theme.typography.headingFont,
          opacity: ctaOpacity,
          maxWidth: 500,
          lineHeight: 1.5,
        }}
      >
        {data.callToAction}
      </p>

      {/* 标签 */}
      {data.tags && data.tags.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginTop: 36, opacity: ctaOpacity }}>
          {data.tags.map((tag, i) => (
            <span
              key={i}
              style={{
                padding: "6px 16px",
                background: `${theme.colors.primary}08`,
                border: `1px solid ${theme.colors.primary}20`,
                borderRadius: 20,
                fontSize: 16,
                fontWeight: 600,
                color: theme.colors.primary,
                fontFamily: theme.typography.bodyFont,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
