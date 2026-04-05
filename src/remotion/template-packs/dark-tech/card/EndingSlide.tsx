import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../../shared/Background";
import { AnimatedText } from "../../../shared/AnimatedText";
import { COLORS, FONTS } from "../../../styles/theme";
import type { EndingSlide as EndingSlideData } from "@/lib/types/card-video";

interface Props {
  data: EndingSlideData;
  style?: "dark-tech" | "minimal-light" | "gradient-purple";
}

export const EndingSlideComp: React.FC<Props> = ({
  data,
  style = "dark-tech",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const avatarScale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 120 },
  });

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
        {/* 头像 */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${avatarScale})`,
            boxShadow: `0 0 40px ${COLORS.primary}30`,
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: COLORS.onPrimary,
              fontFamily: FONTS.headline,
            }}
          >
            {data.authorName.charAt(0)}
          </span>
        </div>

        {/* 作者名字 */}
        <AnimatedText
          text={data.authorName}
          mode="slideUp"
          delay={8}
          fontSize={32}
          fontFamily={FONTS.headline}
          fontWeight={700}
          color={COLORS.onSurface}
        />

        {/* CTA */}
        <div style={{ marginTop: 40 }}>
          <AnimatedText
            text={data.callToAction}
            mode="slideUp"
            delay={20}
            fontSize={36}
            fontWeight={700}
            color={COLORS.primary}
          />
        </div>

        {/* 标签 */}
        {data.tags && data.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 40,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {data.tags.map((tag, i) => (
              <AnimatedText
                key={i}
                text={`#${tag}`}
                mode="fadeIn"
                delay={35 + i * 5}
                fontSize={18}
                color={COLORS.onSurfaceVariant}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1px solid ${COLORS.outlineVariant}40`,
                }}
              />
            ))}
          </div>
        )}

        {/* 底部装饰 */}
        <div
          style={{
            marginTop: 60,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 2,
              background: `${COLORS.primary}40`,
            }}
          />
          <AnimatedText
            text="感谢观看"
            mode="fadeIn"
            delay={50}
            fontSize={16}
            color={COLORS.onSurfaceVariant}
            style={{ letterSpacing: 6 }}
          />
          <div
            style={{
              width: 40,
              height: 2,
              background: `${COLORS.primary}40`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
