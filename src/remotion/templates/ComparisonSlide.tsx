import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../shared/Background";
import { AnimatedText } from "../shared/AnimatedText";
import { COLORS, FONTS } from "../styles/theme";
import type { ComparisonSlide as ComparisonSlideData } from "@/lib/types/card-video";

interface Props {
  data: ComparisonSlideData;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

export const ComparisonSlideComp: React.FC<Props> = ({
  data,
  style = "dark-tech",
}) => {
  const renderColumn = (
    side: ComparisonSlideData["left"],
    isRight: boolean,
    delay: number
  ) => (
    <div
      style={{
        flex: 1,
        background: `${COLORS.surfaceHigh}80`,
        borderRadius: 16,
        padding: "36px 30px",
        border: `1px solid ${COLORS.outlineVariant}30`,
      }}
    >
      <AnimatedText
        text={side.title}
        mode="slideUp"
        delay={delay}
        fontSize={28}
        fontFamily={FONTS.headline}
        fontWeight={700}
        color={isRight ? COLORS.primary : COLORS.onSurfaceVariant}
      />
      {side.subtitle && (
        <div style={{ marginTop: 6 }}>
          <AnimatedText
            text={side.subtitle}
            mode="fadeIn"
            delay={delay + 5}
            fontSize={18}
            color={COLORS.onSurfaceVariant}
          />
        </div>
      )}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {side.items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: 20,
                color: item.positive ? "#4ade80" : COLORS.error,
              }}
            >
              {item.positive ? "✓" : "✗"}
            </span>
            <AnimatedText
              text={item.text}
              mode="fadeIn"
              delay={delay + 10 + i * 6}
              fontSize={22}
              color={COLORS.onSurface}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AbsoluteFill>
      <Background />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          padding: "80px 60px",
        }}
      >
        <AnimatedText
          text={data.heading}
          mode="slideUp"
          fontSize={42}
          fontFamily={FONTS.headline}
          fontWeight={700}
          color={COLORS.onSurface}
          style={{ marginBottom: 40, textAlign: "center" }}
        />
        <div style={{ display: "flex", gap: 24 }}>
          {renderColumn(data.left, false, 10)}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 28,
              color: COLORS.outlineVariant,
              fontWeight: 700,
            }}
          >
            VS
          </div>
          {renderColumn(data.right, true, 20)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
