import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../shared/Background";
import { AnimatedText } from "../shared/AnimatedText";
import { NumberBadge } from "../shared/NumberBadge";
import { COLORS, FONTS } from "../styles/theme";
import type { NumberedListSlide as NumberedListSlideData } from "@/lib/types/card-video";

interface Props {
  data: NumberedListSlideData;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

export const NumberedListSlideComp: React.FC<Props> = ({
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
            fontSize={42}
            fontFamily={FONTS.headline}
            fontWeight={700}
            color={COLORS.onSurface}
            style={{ marginBottom: 50 }}
          />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {data.items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
              }}
            >
              <NumberBadge number={i + 1} delay={i * 8 + 10} size={44} />
              <div style={{ flex: 1 }}>
                <AnimatedText
                  text={item.text}
                  mode="slideUp"
                  delay={i * 8 + 12}
                  fontSize={32}
                  fontWeight={600}
                  color={COLORS.onSurface}
                />
                {item.detail && (
                  <div style={{ marginTop: 6 }}>
                    <AnimatedText
                      text={item.detail}
                      mode="fadeIn"
                      delay={i * 8 + 18}
                      fontSize={22}
                      color={COLORS.onSurfaceVariant}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {data.tags && data.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 50,
              flexWrap: "wrap",
            }}
          >
            {data.tags.map((tag, i) => (
              <AnimatedText
                key={i}
                text={tag}
                mode="fadeIn"
                delay={40 + i * 5}
                fontSize={16}
                color={COLORS.primary}
                fontWeight={700}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: `1px solid ${COLORS.primary}40`,
                  background: `${COLORS.primary}10`,
                  letterSpacing: 1,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
