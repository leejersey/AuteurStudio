import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../../../shared/Background";
import { AnimatedText } from "../../../shared/AnimatedText";
import { COLORS, FONTS } from "../../../styles/theme";
import type { QuoteSlide as QuoteSlideData } from "@/lib/types/card-video";

interface Props {
  data: QuoteSlideData;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

export const QuoteSlideComp: React.FC<Props> = ({
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
          height: "100%",
          padding: "80px 60px",
        }}
      >
        {data.heading && (
          <AnimatedText
            text={data.heading}
            mode="slideUp"
            fontSize={36}
            fontFamily={FONTS.headline}
            fontWeight={700}
            color={COLORS.onSurface}
            style={{ marginBottom: 40 }}
          />
        )}

        {/* 引用框 */}
        <div
          style={{
            borderLeft: `4px solid ${COLORS.secondary}`,
            paddingLeft: 30,
            marginBottom: 30,
          }}
        >
          <span
            style={{
              fontSize: 60,
              color: COLORS.secondary,
              opacity: 0.3,
              lineHeight: 0.5,
              fontFamily: "serif",
            }}
          >
            "
          </span>
          <AnimatedText
            text={data.quote}
            mode="typewriter"
            delay={10}
            fontSize={30}
            color={COLORS.onSurface}
            fontWeight={500}
            style={{ lineHeight: 1.6, fontStyle: "italic" }}
          />
        </div>

        {data.source && (
          <AnimatedText
            text={`— ${data.source}`}
            mode="fadeIn"
            delay={40}
            fontSize={20}
            color={COLORS.onSurfaceVariant}
            style={{ marginBottom: 30, textAlign: "right" }}
          />
        )}

        {data.summary && (
          <div
            style={{
              background: `${COLORS.primary}10`,
              borderRadius: 12,
              padding: "20px 24px",
              border: `1px solid ${COLORS.primary}20`,
              marginBottom: 24,
            }}
          >
            <AnimatedText
              text={`💡 ${data.summary}`}
              mode="slideUp"
              delay={45}
              fontSize={24}
              color={COLORS.primary}
              fontWeight={600}
            />
          </div>
        )}

        {data.discussionPrompts && data.discussionPrompts.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 10,
            }}
          >
            {data.discussionPrompts.map((prompt, i) => (
              <AnimatedText
                key={i}
                text={`💬 ${prompt}`}
                mode="fadeIn"
                delay={55 + i * 8}
                fontSize={22}
                color={COLORS.onSurfaceVariant}
              />
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
