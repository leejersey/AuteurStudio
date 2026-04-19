import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../../shared/Background";
import { AnimatedText } from "../../../shared/AnimatedText";
import { StatCounter } from "../../../shared/StatCounter";
import { ProgressBar } from "../../../shared/ProgressBar";
import { DecorativePattern } from "../../../shared/DecorativePattern";
import { WaveBackground } from "../../../shared/WaveBackground";
import { Divider } from "../../../shared/Divider";
import { GlowOrb } from "../../../shared/GlowOrb";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import type { StatsSlide as StatsSlideData } from "@/lib/types/card-video";

interface Props {
  data: StatsSlideData;
}

export const StatsSlideComp: React.FC<Props> = ({ data }) => {
  const theme = useTemplateTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const variant = data.layoutVariant || "grid";
  const accentColor = data.colorAccent || theme.colors.primary;

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 100 },
  });

  const statColors = [
    accentColor,
    theme.colors.secondary,
    theme.colors.tertiary,
    theme.colors.primaryDim,
  ];

  const renderStatCard = (
    stat: StatsSlideData["stats"][number],
    i: number,
    size: "large" | "normal" = "normal"
  ) => {
    const color = stat.color ?? statColors[i % statColors.length];
    const delay = 10 + i * 10;
    const cardFrame = Math.max(0, frame - delay);
    const cardProgress = spring({
      frame: cardFrame,
      fps,
      config: { damping: 14, mass: 0.6, stiffness: 100 },
    });

    const fontSize = size === "large"
      ? theme.typography.headingSize + 20
      : theme.typography.headingSize;

    return (
      <div
        key={i}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: size === "large" ? "32px 24px" : "24px 16px",
          background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
          borderRadius: theme.layout.borderRadius,
          border: `1px solid ${color}25`,
          borderTop: `3px solid ${color}`,
          backdropFilter: "blur(16px)",
          boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 ${color}10, 0 0 50px ${color}08`,
          width: "100%",
          opacity: cardProgress,
          transform: `translateY(${(1 - cardProgress) * 30}px) scale(${0.9 + cardProgress * 0.1})`,
        }}
      >
        {stat.showProgress ? (
          <ProgressBar
            value={stat.value}
            label={stat.label}
            color={color}
            delay={delay}
            style="circular"
            size={size === "large" ? 160 : 120}
            strokeWidth={size === "large" ? 12 : 8}
          />
        ) : (
          <StatCounter
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
            color={color}
            fontSize={fontSize}
            delay={delay}
          />
        )}
      </div>
    );
  };

  const renderStats = () => {
    const stats = data.stats;

    if (variant === "featured" && stats.length >= 2) {
      const [main, ...rest] = stats;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "center", width: "100%" }}>
          {renderStatCard(main, 0, "large")}
          <div style={{ display: "flex", gap: 20, width: "100%" }}>
            {rest.map((stat, i) => renderStatCard(stat, i + 1, "normal"))}
          </div>
        </div>
      );
    }

    if (variant === "row") {
      return (
        <div style={{ display: "flex", gap: 20, width: "100%" }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ flex: 1 }}>
              {renderStatCard(stat, i)}
            </div>
          ))}
        </div>
      );
    }

    // grid
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        width: "100%",
      }}>
        {stats.map((stat, i) => renderStatCard(stat, i))}
      </div>
    );
  };

  return (
    <AbsoluteFill>
      <Background imageUrl={data.imageUrl} imageCredit={data.imageCredit} />

      {/* 装饰层 */}
      <DecorativePattern
        pattern={(data.decorations?.find(d => ["circuit", "hexagon", "wave", "dots-grid"].includes(d)) as "circuit" | "hexagon" | "wave" | "dots-grid") || "hexagon"}
        opacity={0.12}
        color={accentColor}
      />
      <WaveBackground layers={2} opacity={0.12} amplitude={15} speed={0.5} position="bottom" colors={[accentColor, theme.colors.secondary]} />

      {/* 背景光球 */}
      <GlowOrb x="70%" y="30%" size={400} pulseSpeed={90} color={accentColor} />
      <GlowOrb x="25%" y="70%" size={300} pulseSpeed={130} color={theme.colors.secondary} blur={80} />

      {/* 顶部光晕 */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "35%",
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${accentColor}15, transparent)`,
        pointerEvents: "none",
      }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: `${theme.spacing.pagePaddingY}px ${theme.spacing.pagePaddingX}px`,
          gap: 40,
          position: "relative",
          zIndex: 1,
        }}
      >
        {data.heading && (
          <div style={{
            opacity: titleProgress,
            transform: `translateY(${(1 - titleProgress) * 30}px)`,
            width: "100%",
          }}>
            <AnimatedText
              text={data.heading}
              mode="slideUp"
              fontSize={42}
              fontFamily={theme.typography.headingFont}
              fontWeight={800}
              color={theme.colors.text}
              style={{ textAlign: "center", letterSpacing: 1.5 }}
            />
            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <Divider variant="gradient" color={accentColor} glow animated thickness={3} length={160} />
            </div>
          </div>
        )}

        {renderStats()}
      </div>
    </AbsoluteFill>
  );
};
