import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../../../shared/Background";
import { GradientTitle } from "../../../shared/GradientTitle";
import { AnimatedText } from "../../../shared/AnimatedText";
import { COLORS, FONTS } from "../../../styles/theme";
import type { TitleSlide as TitleSlideData } from "@/lib/types/card-video";

interface Props {
  data: TitleSlideData;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

export const TitleSlideComp: React.FC<Props> = ({
  data,
  style = "dark-tech",
}) => {
  return (
    <AbsoluteFill>
      <Background style={style} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "80px 60px",
          textAlign: "center",
        }}
      >
        {/* 分类标签 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 24,
              height: 2,
              background: COLORS.primary,
            }}
          />
          <AnimatedText
            text={data.category}
            mode="fadeIn"
            fontSize={20}
            color={COLORS.primary}
            fontFamily={FONTS.body}
            fontWeight={700}
            style={{ letterSpacing: 4, textTransform: "uppercase" }}
          />
          <div
            style={{
              width: 24,
              height: 2,
              background: COLORS.primary,
            }}
          />
        </div>

        {/* 主标题 */}
        <GradientTitle
          text={data.heading}
          highlightWords={data.highlightWords}
          fontSize={80}
          delay={10}
        />

        {/* 副标题 */}
        <div style={{ marginTop: 30 }}>
          <AnimatedText
            text={data.subtitle}
            mode="slideUp"
            delay={25}
            fontSize={28}
            color={COLORS.onSurfaceVariant}
            fontWeight={400}
          />
        </div>

        {/* 底部装饰线 */}
        <div
          style={{
            marginTop: 60,
            width: 80,
            height: 3,
            background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
