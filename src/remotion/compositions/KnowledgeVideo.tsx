import React, { useCallback, useMemo } from "react";
import { AbsoluteFill, Sequence, Audio, staticFile, interpolate } from "remotion";
import type { KnowledgeVideoData, LandscapeSlide } from "@/lib/types/landscape-video";
import { TIMING } from "../styles/theme";
import { getTemplate, getDefaultTemplateId } from "../template-registry";
import type { KnowledgeSlideRenderers } from "../template-registry";
import { NarrationSubtitle } from "../shared/NarrationSubtitle";
import { TemplateThemeProvider } from "../TemplateThemeContext";
import { mergeTheme } from "../template-theme";
import type { DeepPartial, TemplateTheme } from "../template-theme";

// 确保模板已注册（side-effect import）
import "../template-packs/dark-tech";
import "../template-packs/minimal-white";

const DEFAULT_BGM = "audio/bgm-tech-01.wav";
const MIN_SLIDE_FRAMES = 4 * TIMING.fps; // 最短 4 秒

interface KnowledgeVideoProps {
  data: KnowledgeVideoData;
}

// 渲染单个 Slide
function renderSlide(slide: LandscapeSlide, renderers: KnowledgeSlideRenderers): React.ReactNode {
  switch (slide.type) {
    case "landscape_title":
      return (
        <renderers.LandscapeTitleSlide
          heading={slide.heading}
          subtitle={slide.subtitle}
          tags={slide.tags}
        />
      );
    case "landscape_content":
      return (
        <renderers.LandscapeContentSlide
          heading={slide.heading}
          points={slide.points}
          imageUrl={slide.imageUrl}
          imageCredit={slide.imageCredit}
        />
      );
    case "landscape_diagram":
      return (
        <renderers.LandscapeDiagramSlide
          heading={slide.heading}
          diagramType={slide.diagramType}
          nodes={slide.nodes}
          connections={slide.connections}
        />
      );
    case "landscape_ending":
      return (
        <renderers.LandscapeEndingSlide
          heading={slide.heading}
          summary={slide.summary}
          keyTakeaways={slide.keyTakeaways}
          callToAction={slide.callToAction}
        />
      );
    default:
      return null;
  }
}

// 计算每页时长（基于旁白 durationMs）
function getSlideDurations(data: KnowledgeVideoData): number[] {
  const fps = TIMING.fps;

  return data.slides.map((slide) => {
    const narr = data.narration[slide.narrationIndex];
    if (!narr?.durationMs) return MIN_SLIDE_FRAMES;

    const frames = Math.ceil((narr.durationMs / 1000) * fps);
    return Math.max(MIN_SLIDE_FRAMES, frames);
  });
}

// 导出总帧数计算供外部使用
export function calcKnowledgeTotalFrames(data: KnowledgeVideoData): number {
  if (!data?.slides?.length) return 120;
  return getSlideDurations(data).reduce((sum, d) => sum + d, 0);
}

export const KnowledgeVideo: React.FC<KnowledgeVideoProps> = ({ data }) => {
  // 防御性检查
  if (!data?.slides?.length) {
    return <AbsoluteFill style={{ background: "#0b0e14" }} />;
  }

  // 根据 templateId 获取对应的 slide 渲染器和 theme
  const templateId = data.meta.templateId || getDefaultTemplateId();
  const template = getTemplate(templateId);
  const defaultTemplate = getTemplate(getDefaultTemplateId());

  if (!template && !defaultTemplate) {
    return <AbsoluteFill style={{ background: "#0b0e14" }} />;
  }

  const resolvedTemplate = template || defaultTemplate!;
  const renderers = resolvedTemplate.knowledge!;
  const baseTheme = resolvedTemplate.theme;
  const theme = (data.meta as Record<string, unknown>).themeOverrides
    ? mergeTheme(baseTheme, (data.meta as Record<string, unknown>).themeOverrides as DeepPartial<TemplateTheme>)
    : baseTheme;

  const slideDurations = useMemo(() => getSlideDurations(data), [data]);

  const slideStartFrames = useMemo(() => {
    const starts: number[] = [0];
    for (let i = 1; i < slideDurations.length; i++) {
      starts.push(starts[i - 1] + slideDurations[i - 1]);
    }
    return starts;
  }, [slideDurations]);

  const totalFrames = slideStartFrames[slideStartFrames.length - 1] + slideDurations[slideDurations.length - 1];

  // BGM 音量
  const hasNarrationAudio = data.narration.some((n) => n.audioUrl);
  const bgmMaxVolume = hasNarrationAudio ? 0.08 : 0.2;

  const bgmVolume = useCallback(
    (f: number) => {
      return interpolate(
        f,
        [0, TIMING.fps, totalFrames - TIMING.fps * 2, totalFrames],
        [0, bgmMaxVolume, bgmMaxVolume, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
    },
    [totalFrames, bgmMaxVolume]
  );

  return (
    <TemplateThemeProvider theme={theme}>
    <AbsoluteFill style={{ fontFamily: theme.typography.bodyFont }}>
      {/* Slide 序列 */}
      {data.slides.map((slide, i) => (
        <Sequence
          key={i}
          from={slideStartFrames[i]}
          durationInFrames={slideDurations[i]}
          name={`Slide-${i}-${slide.type}`}
        >
          <AbsoluteFill>
            {renderSlide(slide, renderers)}

            {/* 旁白字幕 */}
            {data.narration[slide.narrationIndex] && (
              <NarrationSubtitle
                segment={data.narration[slide.narrationIndex]}
              />
            )}
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* 旁白 TTS 音频 — 独立 Sequence */}
      {data.slides.map((slide, i) => {
        const narr = data.narration[slide.narrationIndex];
        if (!narr?.audioUrl) return null;
        return (
          <Sequence
            key={`narr-${i}`}
            from={slideStartFrames[i]}
            durationInFrames={slideDurations[i]}
            name={`Narration-${i}`}
          >
            <Audio src={narr.audioUrl} volume={0.85} />
          </Sequence>
        );
      })}

      {/* BGM */}
      <Audio
        src={staticFile(DEFAULT_BGM)}
        volume={bgmVolume}
        startFrom={0}
      />
    </AbsoluteFill>
    </TemplateThemeProvider>
  );
};
