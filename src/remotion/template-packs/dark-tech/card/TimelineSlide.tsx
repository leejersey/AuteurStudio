import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Background } from "../../../shared/Background";
import { AnimatedText } from "../../../shared/AnimatedText";
import { IconBadge } from "../../../shared/IconBadge";
import { DecorativePattern } from "../../../shared/DecorativePattern";
import { WaveBackground } from "../../../shared/WaveBackground";
import { Divider } from "../../../shared/Divider";
import { GlowOrb } from "../../../shared/GlowOrb";
import { useTemplateTheme } from "../../../TemplateThemeContext";
import type { TimelineSlide as TimelineSlideData } from "@/lib/types/card-video";

interface Props {
  data: TimelineSlideData;
}

export const TimelineSlideComp: React.FC<Props> = ({ data }) => {
  const theme = useTemplateTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accentColor = data.colorAccent || theme.colors.primary;

  const nodeColors = [
    accentColor,
    theme.colors.secondary,
    theme.colors.tertiary,
    theme.colors.primaryDim,
  ];

  return (
    <AbsoluteFill>
      <Background imageUrl={data.imageUrl} imageCredit={data.imageCredit} />

      {/* 装饰层 */}
      <DecorativePattern
        pattern={(data.decorations?.find(d => ["circuit", "hexagon", "wave", "dots-grid"].includes(d)) as "circuit" | "hexagon" | "wave" | "dots-grid") || "dots-grid"}
        opacity={0.12}
        color={accentColor}
      />
      <WaveBackground layers={2} opacity={0.1} amplitude={15} speed={0.4} position="bottom" colors={[accentColor, theme.colors.secondary]} />

      {/* 背景光球 */}
      <GlowOrb x="80%" y="25%" size={350} pulseSpeed={100} color={accentColor} />
      <GlowOrb x="15%" y="80%" size={250} pulseSpeed={140} color={theme.colors.secondary} blur={80} />

      {/* 左侧渐变 — 强调时间轴 */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "15%", height: "100%",
        background: `linear-gradient(90deg, ${accentColor}08, transparent)`,
        pointerEvents: "none",
      }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          padding: `${theme.spacing.pagePaddingY}px ${theme.spacing.pagePaddingX}px`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* 标题 */}
        <div style={{ marginBottom: 32 }}>
          <AnimatedText
            text={data.heading}
            mode="slideUp"
            fontSize={42}
            fontFamily={theme.typography.headingFont}
            fontWeight={800}
            color={theme.colors.text}
            style={{ letterSpacing: 1.5 }}
          />
          <div style={{ marginTop: 14 }}>
            <Divider variant="gradient" color={accentColor} glow animated thickness={3} length={180} />
          </div>
        </div>

        {/* 时间线 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
          {data.events.map((event, i) => {
            const nodeDelay = i * 12 + 10;
            const nodeFrame = Math.max(0, frame - nodeDelay);
            const nodeProgress = spring({
              frame: nodeFrame,
              fps,
              config: { damping: 16, mass: 0.7, stiffness: 120 },
            });

            const lineDelay = nodeDelay + 4;
            const lineFrame = Math.max(0, frame - lineDelay);
            const lineProgress = interpolate(lineFrame, [0, 15], [0, 1], {
              extrapolateRight: "clamp",
            });

            const nodeColor = nodeColors[i % nodeColors.length];

            return (
              <React.Fragment key={i}>
                {/* 连接线 — 发光渐变 */}
                {i > 0 && (
                  <div style={{ display: "flex", paddingLeft: 27, height: 20 }}>
                    <div
                      style={{
                        width: 3,
                        height: `${lineProgress * 100}%`,
                        background: `linear-gradient(180deg, ${nodeColors[(i - 1) % nodeColors.length]}80, ${nodeColor}80)`,
                        boxShadow: `0 0 12px ${nodeColor}50, 0 0 4px ${nodeColor}30`,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                )}

                {/* 节点卡片 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 20,
                    opacity: nodeProgress,
                    transform: `translateX(${(1 - nodeProgress) * 60}px)`,
                  }}
                >
                  {/* 时间轴圆点 */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    {event.icon ? (
                      <IconBadge
                        icon={event.icon}
                        shape="circle"
                        size={56}
                        gradient={[nodeColor, `${nodeColor}cc`]}
                        delay={nodeDelay}
                      />
                    ) : (
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${nodeColor}, ${nodeColor}cc)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `0 0 25px ${nodeColor}50, inset 0 0 15px rgba(255,255,255,0.1)`,
                          transform: `scale(${nodeProgress})`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: theme.colors.onPrimary,
                            fontFamily: theme.typography.headingFont,
                          }}
                        >
                          {event.time}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 卡片内容 — 玻璃拟态 + 渐变边框 */}
                  <div
                    style={{
                      flex: 1,
                      background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
                      backdropFilter: "blur(16px)",
                      borderRadius: 16,
                      padding: "20px 28px",
                      border: `1px solid ${nodeColor}25`,
                      borderLeft: `4px solid ${nodeColor}`,
                      boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 ${nodeColor}10, 0 0 30px ${nodeColor}06`,
                    }}
                  >
                    {event.icon && (
                      <AnimatedText
                        text={event.time}
                        mode="fadeIn"
                        delay={nodeDelay + 2}
                        fontSize={14}
                        color={nodeColor}
                        fontWeight={700}
                        style={{ letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}
                      />
                    )}
                    <AnimatedText
                      text={event.title}
                      mode="slideUp"
                      delay={nodeDelay + 4}
                      fontSize={24}
                      fontWeight={600}
                      color={theme.colors.text}
                      style={{ lineHeight: 1.5 }}
                    />
                    {event.detail && (
                      <div style={{ marginTop: 8 }}>
                        <AnimatedText
                          text={event.detail}
                          mode="fadeIn"
                          delay={nodeDelay + 10}
                          fontSize={18}
                          color={theme.colors.textMuted}
                          style={{ lineHeight: 1.5 }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
