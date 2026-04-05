// MarkdownVideo 主 Composition — Markdown 技术教程视频
import React, { useCallback, useMemo } from "react";
import { AbsoluteFill, Sequence, Audio, staticFile, interpolate } from "remotion";
import type { MarkdownVideoData, MarkdownSlide } from "@/lib/types/markdown-video";
import { FONTS, TIMING } from "../styles/theme";
import { getTemplate, getDefaultTemplateId } from "../template-registry";
import type { MarkdownSlideRenderers } from "../template-registry";
import { NarrationSubtitle } from "../shared/NarrationSubtitle";

const DEFAULT_BGM = "audio/bgm-tech-01.wav";

function estimateDurationMs(text: string): number {
  return Math.max(3000, Math.ceil((text.length / 4) * 1000) + 500);
}

const MIN_SLIDE_FRAMES = 4 * TIMING.fps;
// 代码页需要更长时间展示
const MIN_CODE_SLIDE_FRAMES = 6 * TIMING.fps;

interface MarkdownVideoProps {
  data: MarkdownVideoData;
}

function renderSlide(
  slide: MarkdownSlide,
  codeTheme: MarkdownVideoData["meta"]["codeTheme"],
  durationInFrames: number,
  renderers: MarkdownSlideRenderers
): React.ReactNode {
  switch (slide.type) {
    case "md_title":
      return (
        <renderers.MarkdownTitleSlide
          heading={slide.heading}
          subtitle={slide.subtitle}
          tags={slide.tags}
        />
      );
    case "md_content":
      return (
        <renderers.MarkdownContentSlide
          heading={slide.heading}
          points={slide.points}
        />
      );
    case "md_code":
      return (
        <renderers.MarkdownCodeSlide
          heading={slide.heading}
          language={slide.language}
          lines={slide.lines}
          highlightLines={slide.highlightLines}
          theme={codeTheme}
          durationInFrames={durationInFrames}
        />
      );
    case "md_ending":
      return (
        <renderers.MarkdownEndingSlide
          heading={slide.heading}
          summary={slide.summary}
          callToAction={slide.callToAction}
        />
      );
    default:
      return null;
  }
}

// 计算每页时长
function getSlideDurations(data: MarkdownVideoData): number[] {
  const fps = TIMING.fps;

  return data.slides.map((slide) => {
    const narr = data.narration[slide.narrationIndex];
    const baseDurationMs = narr?.durationMs || estimateDurationMs(narr?.text || "");
    const baseFrames = Math.ceil((baseDurationMs / 1000) * fps);

    // 代码页额外加时间：每 10 行代码额外 2 秒
    if (slide.type === "md_code") {
      const extraCodeFrames = Math.ceil((slide.lines.length / 10) * 2 * fps);
      return Math.max(MIN_CODE_SLIDE_FRAMES, baseFrames + extraCodeFrames);
    }

    return Math.max(MIN_SLIDE_FRAMES, baseFrames);
  });
}

export function calcMarkdownTotalFrames(data: MarkdownVideoData): number {
  if (!data?.slides?.length) return 120;
  return getSlideDurations(data).reduce((sum, d) => sum + d, 0);
}

export const MarkdownVideo: React.FC<MarkdownVideoProps> = ({ data }) => {
  if (!data?.slides?.length) {
    return <AbsoluteFill style={{ background: "#0b0e14" }} />;
  }

  // 根据 templateId 获取对应的 slide 渲染器
  const templateId = data.meta.templateId || getDefaultTemplateId();
  const template = getTemplate(templateId);
  const renderers = template?.markdown || getTemplate(getDefaultTemplateId())!.markdown!;

  const slideDurations = useMemo(() => getSlideDurations(data), [data]);

  const slideStartFrames = useMemo(() => {
    const starts: number[] = [0];
    for (let i = 1; i < slideDurations.length; i++) {
      starts.push(starts[i - 1] + slideDurations[i - 1]);
    }
    return starts;
  }, [slideDurations]);

  const totalFrames =
    slideStartFrames[slideStartFrames.length - 1] +
    slideDurations[slideDurations.length - 1];

  const hasNarrationAudio = data.narration.some((n) => n.audioUrl);
  const bgmMaxVolume = hasNarrationAudio ? 0.06 : 0.18;

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
    <AbsoluteFill style={{ fontFamily: FONTS.body }}>
      {/* Slide 序列 */}
      {data.slides.map((slide, i) => (
        <Sequence
          key={i}
          from={slideStartFrames[i]}
          durationInFrames={slideDurations[i]}
          name={`Slide-${i}-${slide.type}`}
        >
          <AbsoluteFill>
            {renderSlide(slide, data.meta.codeTheme, slideDurations[i], renderers)}

            {/* 旁白字幕 */}
            {data.narration[slide.narrationIndex] && (
              <NarrationSubtitle
                segment={data.narration[slide.narrationIndex]}
              />
            )}
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* 旁白音频 */}
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
  );
};
