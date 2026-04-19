import React, { useCallback, useMemo } from "react";
import { AbsoluteFill, Sequence, Audio, staticFile, interpolate } from "remotion";
import type { CardVideoData, Slide } from "@/lib/types/card-video";
import { TIMING } from "../styles/theme";
import { SlideTransition } from "../shared/SlideTransition";
import { getTemplate, getDefaultTemplateId } from "../template-registry";
import type { CardSlideRenderers } from "../template-registry";
import { TemplateThemeProvider } from "../TemplateThemeContext";
import { mergeTheme } from "../template-theme";
import type { DeepPartial, TemplateTheme } from "../template-theme";

// 确保模板已注册（side-effect import）
import "../template-packs/dark-tech";
import "../template-packs/minimal-white";

// 默认 BGM（无自定义时使用）
const DEFAULT_BGM = "audio/bgm-tech-01.wav";

// 从文本估算时长（中文 ~4字/秒）
function estimateDurationMs(text: string): number {
  return Math.max(3000, Math.ceil((text.length / 4) * 1000) + 500);
}

interface NarrationSegment {
  text: string;
  durationMs?: number;
  audioUrl?: string;
}

interface CardVideoProps {
  data: CardVideoData & {
    narration?: NarrationSegment[];
  };
}

function renderSlide(
  slide: Slide,
  style: CardVideoData["meta"]["style"],
  renderers: CardSlideRenderers
): React.ReactNode {
  switch (slide.type) {
    case "title":
      return <renderers.TitleSlide data={slide} style={style} />;
    case "numbered_list":
      return <renderers.NumberedListSlide data={slide} style={style} />;
    case "comparison":
      return <renderers.ComparisonSlide data={slide} style={style} />;
    case "steps":
      return <renderers.StepsSlide data={slide} style={style} />;
    case "quote":
      return <renderers.QuoteSlide data={slide} style={style} />;
    case "ending":
      return <renderers.EndingSlide data={slide} style={style} />;
    case "stats":
      return <renderers.StatsSlide data={slide} style={style} />;
    case "timeline":
      return <renderers.TimelineSlide data={slide} style={style} />;
    case "highlight":
      return <renderers.HighlightSlide data={slide} style={style} />;
    default:
      return null;
  }
}

export const CardVideo: React.FC<CardVideoProps> = ({ data }) => {
  // 防御性检查
  if (!data?.slides?.length) {
    return <AbsoluteFill style={{ background: "#0b0e14" }} />;
  }

  // 根据 templateId 获取对应的 slide 渲染器和 theme
  const templateId = data.meta.templateId || getDefaultTemplateId();
  const template = getTemplate(templateId);
  const defaultTemplate = getTemplate(getDefaultTemplateId());

  // 防御：模板尚未注册时显示加载中
  if (!template && !defaultTemplate) {
    return <AbsoluteFill style={{ background: "#0b0e14" }} />;
  }

  const resolvedTemplate = template || defaultTemplate!;
  const renderers = resolvedTemplate.card!;
  const baseTheme = resolvedTemplate.theme;
  const theme = (data.meta as Record<string, unknown>).themeOverrides
    ? mergeTheme(baseTheme, (data.meta as Record<string, unknown>).themeOverrides as DeepPartial<TemplateTheme>)
    : baseTheme;

  const { fps } = TIMING;
  const MIN_SLIDE_FRAMES = 4 * fps; // 每页至少 4 秒

  // 计算每页的帧数：优先用 narration 时长，没有则用默认值
  const slideFrames = useMemo(() => {
    const narrations = data.narration;

    return data.slides.map((_slide, i) => {
      if (narrations && narrations[i]) {
        const durationMs =
          narrations[i].durationMs ||
          estimateDurationMs(narrations[i].text || "");
        return Math.max(MIN_SLIDE_FRAMES, Math.ceil((durationMs / 1000) * fps));
      }
      // 无 narration 时用默认时长
      return TIMING.slideDurationSec * fps;
    });
  }, [data.slides, data.narration, fps, MIN_SLIDE_FRAMES]);

  // 每页的起始帧
  const slideOffsets = useMemo(() => {
    const offsets: number[] = [];
    let acc = 0;
    for (const frames of slideFrames) {
      offsets.push(acc);
      acc += frames;
    }
    return offsets;
  }, [slideFrames]);

  const totalFrames = slideOffsets.length > 0
    ? slideOffsets[slideOffsets.length - 1] + slideFrames[slideFrames.length - 1]
    : data.slides.length * TIMING.slideDurationSec * fps;

  // BGM 淡入淡出
  const fadeInFrames = fps;
  const fadeOutFrames = fps * 2;

  const bgmVolume = useCallback(
    (f: number) => {
      return interpolate(
        f,
        [0, fadeInFrames, totalFrames - fadeOutFrames, totalFrames],
        [0, 0.3, 0.3, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
    },
    [fadeInFrames, fadeOutFrames, totalFrames]
  );

  return (
    <TemplateThemeProvider theme={theme}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
      {data.slides.map((slide, i) => (
        <Sequence
          key={i}
          from={slideOffsets[i]}
          durationInFrames={slideFrames[i]}
          name={`Slide-${i}-${slide.type}`}
        >
          <SlideTransition
            durationInFrames={slideFrames[i]}
            direction={i % 2 === 0 ? "left" : "up"}
          >
            {renderSlide(slide, data.meta.style, renderers)}
          </SlideTransition>
        </Sequence>
      ))}

      {/* 旁白音频 */}
      {data.narration?.map((narr, i) =>
        narr.audioUrl ? (
          <Sequence
            key={`audio-${i}`}
            from={slideOffsets[i] || 0}
            durationInFrames={slideFrames[i] || MIN_SLIDE_FRAMES}
          >
            <Audio src={narr.audioUrl} volume={0.9} />
          </Sequence>
        ) : null
      )}

      {/* 背景音乐 — 淡入淡出 */}
      <Audio
        src={staticFile(DEFAULT_BGM)}
        volume={bgmVolume}
        startFrom={0}
      />
    </AbsoluteFill>
    </TemplateThemeProvider>
  );
};
