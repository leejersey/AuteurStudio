import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "../../../shared/Background";
import { AnimatedText } from "../../../shared/AnimatedText";
import { DecorativePattern } from "../../../shared/DecorativePattern";
import { Spotlight } from "../../../shared/Spotlight";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import type { QuoteSlide as QuoteSlideData } from "@/lib/types/card-video";

interface Props {
  data: QuoteSlideData;
}

export const QuoteSlideComp: React.FC<Props> = ({ data }) => {
  const theme = useTemplateTheme();

  return (
    <AbsoluteFill>
      <Background imageUrl={data.imageUrl} imageCredit={data.imageCredit} />

      {/* 装饰层 — 高可见度 */}
      <DecorativePattern pattern="wave" opacity={0.12} color={theme.colors.secondary} />
      <Spotlight position="top-right" color={theme.colors.secondary} opacity={0.08} animated rotateSpeed={-0.1} width={40} />
      {/* 左侧渐变光晕 */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
        background: `radial-gradient(ellipse 80% 60% at 0% 50%, ${theme.colors.secondary}15, transparent)`,
        pointerEvents: "none",
      }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          padding: `${theme.spacing.pagePaddingY}px ${theme.spacing.pagePaddingX}px`,
        }}
      >
        {data.heading && (
          <AnimatedText
            text={data.heading}
            mode="slideUp"
            fontSize={36}
            fontFamily={theme.typography.headingFont}
            fontWeight={700}
            color={theme.colors.text}
            style={{ marginBottom: 40 }}
          />
        )}

        {/* 巨型背景引号 */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "5%",
            fontSize: 800,
            color: theme.colors.secondary,
            opacity: 0.04,
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            zIndex: 0,
            textShadow: `0 0 100px ${theme.colors.secondary}`,
            pointerEvents: "none",
          }}
        >
          “
        </div>

        {/* 引用框 */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            paddingLeft: 40,
            borderLeft: `4px solid ${theme.colors.secondary}`,
            boxShadow: `-10px 0 20px -10px ${theme.colors.secondary}60`, // 左侧发光
            marginBottom: 40,
          }}
        >
          <AnimatedText
            text={data.quote}
            mode="typewriter"
            delay={10}
            fontSize={42}
            color={theme.colors.text}
            fontWeight={600}
            style={{ lineHeight: 1.6, fontStyle: "italic", letterSpacing: 1 }}
          />
        </div>

        {data.source && (
          <div style={{ position: "relative", zIndex: 1, textAlign: "right", paddingRight: 40, marginBottom: 50 }}>
            <div style={{ display: "inline-block", width: 60, height: 2, background: theme.colors.secondary, marginRight: 16, verticalAlign: "middle" }} />
            <AnimatedText
              text={data.source}
              mode="fadeIn"
              delay={40}
              fontSize={24}
              color={theme.colors.textMuted}
              fontWeight={700}
              style={{ display: "inline-block", letterSpacing: 2 }}
            />
          </div>
        )}

        {data.summary && (
          <div
            style={{
              position: "relative",
              zIndex: 1,
              background: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(20px)",
              borderRadius: 16,
              padding: "24px 32px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderTop: `2px solid ${theme.colors.primary}`,
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              marginBottom: 32,
            }}
          >
            <AnimatedText
              text={`💡 ${data.summary}`}
              mode="slideUp"
              delay={45}
              fontSize={26}
              color={theme.colors.text}
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
                delay={55 + i * theme.animation.staggerDelay}
                fontSize={theme.typography.detailSize}
                color={theme.colors.textMuted}
              />
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
