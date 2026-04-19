import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../../shared/Background";
import { AnimatedText } from "../../../shared/AnimatedText";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import { DecorativePattern } from "../../../shared/DecorativePattern";
import type { ComparisonSlide as ComparisonSlideData } from "@/lib/types/card-video";

interface Props {
  data: ComparisonSlideData;
}

export const ComparisonSlideComp: React.FC<Props> = ({ data }) => {
  const theme = useTemplateTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 左侧卡片从左滑入
  const leftProgress = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 18, mass: 0.8, stiffness: 100 },
  });
  const leftX = (1 - leftProgress) * -80;

  // 右侧卡片从右滑入（延迟 10 帧）
  const rightProgress = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 18, mass: 0.8, stiffness: 100 },
  });
  const rightX = (1 - rightProgress) * 80;

  // VS 徽章弹入
  const vsProgress = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 200 },
  });

  const renderColumn = (
    side: ComparisonSlideData["left"],
    isRight: boolean,
    delay: number
  ) => (
    <div
      style={{
        flex: 1,
        background: isRight
          ? `linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)`
          : `linear-gradient(145deg, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0.3) 100%)`,
        backdropFilter: "blur(24px)",
        borderRadius: 24,
        padding: "48px 40px",
        border: `1px solid ${isRight ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)"}`,
        borderTop: isRight ? `2px solid ${theme.colors.primary}` : `1px solid rgba(255,255,255,0.08)`,
        boxShadow: isRight ? `0 20px 60px ${theme.colors.primary}25` : "0 20px 50px rgba(0,0,0,0.4)",
        transform: `translateX(${isRight ? rightX : leftX}px) scale(${isRight ? 1.02 : 0.98})`,
        opacity: isRight ? rightProgress : leftProgress,
        zIndex: isRight ? 2 : 1,
      }}
    >
      <AnimatedText
        text={side.title}
        mode="slideUp"
        delay={delay}
        fontSize={36}
        fontFamily={theme.typography.headingFont}
        fontWeight={800}
        color={isRight ? theme.colors.primary : theme.colors.text}
        style={{ letterSpacing: 1 }}
      />
      {side.subtitle && (
        <div style={{ marginTop: 12 }}>
          <AnimatedText
            text={side.subtitle}
            mode="fadeIn"
            delay={delay + 5}
            fontSize={22}
            color={theme.colors.textMuted}
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
              gap: 16,
              background: "rgba(255,255,255,0.03)",
              padding: "16px 20px",
              borderRadius: 12,
            }}
          >
            <span
              style={{
                fontSize: 24,
                color: item.positive ? "#10b981" : "#ef4444",
                textShadow: item.positive ? "0 0 10px rgba(16, 185, 129, 0.5)" : "0 0 10px rgba(239, 68, 68, 0.3)",
              }}
            >
              {item.positive ? "✓" : "✗"}
            </span>
            <AnimatedText
              text={item.text}
              mode="fadeIn"
              delay={delay + 10 + i * 6}
              fontSize={theme.typography.detailSize}
              color={theme.colors.text}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AbsoluteFill>
      <Background imageUrl={data.imageUrl} imageCredit={data.imageCredit} />

      {/* 装饰层 — 高可见度 */}
      <DecorativePattern
        pattern={(data.decorations?.find(d => ["wave", "diagonal-lines", "circuit", "hexagon"].includes(d)) as "wave" | "diagonal-lines" | "circuit" | "hexagon") || "diagonal-lines"}
        opacity={0.12}
        color={data.colorAccent || theme.colors.primary}
      />
      {/* 中央渐变分隔 */}
      <div style={{
        position: "absolute", top: 0, left: "48%", width: "4%", height: "100%",
        background: `linear-gradient(180deg, transparent, ${theme.colors.primary}15, transparent)`,
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
        <AnimatedText
          text={data.heading}
          mode="slideUp"
          fontSize={theme.typography.subheadingSize}
          fontFamily={theme.typography.headingFont}
          fontWeight={700}
          color={theme.colors.text}
          style={{ marginBottom: 40, textAlign: "center" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          {renderColumn(data.left, false, 10)}
          
          {/* VS 悬浮徽章 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "#fff",
              fontWeight: 900,
              fontStyle: "italic",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)`,
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: `0 0 40px rgba(0, 0, 0, 0.5), 0 0 15px ${theme.colors.primary}30`,
              zIndex: 10,
              margin: "0 -20px",
              transform: `scale(${vsProgress})`,
              opacity: vsProgress,
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
