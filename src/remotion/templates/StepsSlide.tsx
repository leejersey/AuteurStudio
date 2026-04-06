import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../shared/Background";
import { SlideImage } from "../shared/SlideImage";
import { AnimatedText } from "../shared/AnimatedText";
import { COLORS, FONTS } from "../styles/theme";
import type { StepsSlide as StepsSlideData } from "@/lib/types/card-video";

interface Props {
  data: StepsSlideData;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

export const StepsSlideComp: React.FC<Props> = ({
  data,
  style = "dark-tech",
}) => {
  const content = (
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
        style={{ marginBottom: 12 }}
      />
      {data.subheading && (
        <AnimatedText
          text={data.subheading}
          mode="fadeIn"
          delay={8}
          fontSize={22}
          color={COLORS.onSurfaceVariant}
          style={{ marginBottom: 40 }}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {data.steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              background: `${COLORS.surfaceHigh}80`,
              borderRadius: 12,
              padding: "20px 24px",
              borderLeft: `3px solid ${COLORS.primary}`,
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: COLORS.primary,
                fontFamily: FONTS.headline,
                minWidth: 36,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1 }}>
              <AnimatedText
                text={step.action}
                mode="slideUp"
                delay={i * 10 + 15}
                fontSize={26}
                fontWeight={600}
                color={COLORS.onSurface}
              />
            </div>
            {step.note && (
              <AnimatedText
                text={step.note}
                mode="fadeIn"
                delay={i * 10 + 20}
                fontSize={18}
                color={COLORS.onSurfaceVariant}
              />
            )}
          </div>
        ))}
      </div>

      {data.linkCard && (
        <div
          style={{
            marginTop: 30,
            padding: "16px 24px",
            background: `${COLORS.primary}15`,
            borderRadius: 12,
            border: `1px solid ${COLORS.primary}30`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>🔗</span>
          <AnimatedText
            text={data.linkCard.title}
            mode="fadeIn"
            delay={50}
            fontSize={20}
            color={COLORS.primary}
            fontWeight={600}
          />
        </div>
      )}
    </div>
  );

  return (
    <AbsoluteFill>
      {data.imageUrl ? (
        <SlideImage
          src={data.imageUrl}
          layout="background"
          credit={data.imageCredit}
          overlayDarkness={0.55}
        >
          {content}
        </SlideImage>
      ) : (
        <>
          <Background />
          {content}
        </>
      )}
    </AbsoluteFill>
  );
};

