import React, { useCallback, useMemo } from "react";
import { AbsoluteFill, Sequence, Audio, staticFile, interpolate } from "remotion";
import type { AlgoVideoData } from "@/lib/types/algo-video";
import { TIMING } from "../styles/theme";
import { AnimatedText } from "../shared/AnimatedText";
import { getTemplate, getDefaultTemplateId } from "../template-registry";
import type { AlgoSlideRenderers } from "../template-registry";
import { NarrationSubtitle } from "../shared/NarrationSubtitle";
import { TemplateThemeProvider } from "../TemplateThemeContext";
import { mergeTheme } from "../template-theme";
import type { DeepPartial, TemplateTheme } from "../template-theme";

// 确保模板已注册（side-effect import）
import "../template-packs/dark-tech";
import "../template-packs/minimal-white";

const DEFAULT_BGM = "audio/bgm-tech-01.wav";
const MIN_STEP_FRAMES = 3 * TIMING.fps; // 最短 3 秒

interface AlgoVideoProps {
  data: AlgoVideoData;
}

// 计算每步的帧数（基于旁白时长）
function getStepDurations(data: AlgoVideoData): number[] {
  const fps = TIMING.fps;

  // 对每个 narrationIndex，找到引用它的步骤数量
  const narrationStepCount: Record<number, number> = {};
  data.steps.forEach((step) => {
    narrationStepCount[step.narrationIndex] =
      (narrationStepCount[step.narrationIndex] || 0) + 1;
  });

  return data.steps.map((step) => {
    const narr = data.narration[step.narrationIndex];
    if (!narr?.durationMs) return MIN_STEP_FRAMES;

    // 该旁白被多少步骤共享
    const sharedCount = narrationStepCount[step.narrationIndex] || 1;

    // 将旁白时长均分到共享该旁白的步骤
    const perStepMs = narr.durationMs / sharedCount;
    const frames = Math.ceil((perStepMs / 1000) * fps);

    return Math.max(MIN_STEP_FRAMES, frames);
  });
}

// 导出供 useVideoData 使用
export function calcAlgoTotalFrames(data: AlgoVideoData): number {
  if (!data?.steps?.length) return 120;
  return getStepDurations(data).reduce((sum, d) => sum + d, 0);
}

export const AlgoVideo: React.FC<AlgoVideoProps> = ({ data }) => {
  // 防御性检查
  if (!data?.steps?.length) {
    return <AbsoluteFill style={{ background: "#0b0e14" }} />;
  }

  // 根据 templateId 获取对应的 slide 渲染器和 theme
  const templateId = data.meta.templateId || getDefaultTemplateId();
  const tpl = getTemplate(templateId);
  const defaultTemplate = getTemplate(getDefaultTemplateId());

  if (!tpl && !defaultTemplate) {
    return <AbsoluteFill style={{ background: "#0b0e14" }} />;
  }

  const resolvedTemplate = tpl || defaultTemplate!;
  const renderers = resolvedTemplate.algo!;
  const baseTheme = resolvedTemplate.theme;
  const theme = (data.meta as Record<string, unknown>).themeOverrides
    ? mergeTheme(baseTheme, (data.meta as Record<string, unknown>).themeOverrides as DeepPartial<TemplateTheme>)
    : baseTheme;

  // 各步的帧数（基于旁白时长）
  const stepDurations = useMemo(() => getStepDurations(data), [data]);

  // 各步的起始帧
  const stepStartFrames = useMemo(() => {
    const starts: number[] = [0];
    for (let i = 1; i < stepDurations.length; i++) {
      starts.push(starts[i - 1] + stepDurations[i - 1]);
    }
    return starts;
  }, [stepDurations]);

  const totalFrames = stepStartFrames[stepStartFrames.length - 1] + stepDurations[stepDurations.length - 1];

  // 计算每段旁白的顶层 Sequence 信息（跨越所有共享它的步骤）
  const narrationSequences = useMemo(() => {
    const result: { narrationIndex: number; fromFrame: number; durationFrames: number }[] = [];
    const seen = new Set<number>();

    data.steps.forEach((step, i) => {
      if (seen.has(step.narrationIndex)) return;
      seen.add(step.narrationIndex);

      // 找到所有使用该 narrationIndex 的步骤
      const firstStepIdx = i;
      let lastStepIdx = i;
      for (let j = i + 1; j < data.steps.length; j++) {
        if (data.steps[j].narrationIndex === step.narrationIndex) {
          lastStepIdx = j;
        }
      }

      const fromFrame = stepStartFrames[firstStepIdx];
      const endFrame = stepStartFrames[lastStepIdx] + stepDurations[lastStepIdx];

      result.push({
        narrationIndex: step.narrationIndex,
        fromFrame,
        durationFrames: endFrame - fromFrame,
      });
    });

    return result;
  }, [data.steps, stepStartFrames, stepDurations]);

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
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${theme.colors.background} 0%, #060810 100%)`,
        fontFamily: theme.typography.bodyFont,
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <AnimatedText
          text={data.meta.title}
          mode="slideUp"
          fontSize={36}
          fontFamily={theme.typography.headingFont}
          fontWeight={700}
          color={theme.colors.text}
        />
        <div
          style={{
            padding: "6px 16px",
            background: `${theme.colors.primary}15`,
            border: `1px solid ${theme.colors.primary}30`,
            borderRadius: 20,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: theme.colors.primary,
              letterSpacing: 2,
            }}
          >
            {data.meta.algorithm}
          </span>
        </div>
      </div>

      {/* 步骤序列（动态时长） — 只渲染视觉内容，不含音频 */}
      {data.steps.map((step, i) => (
        <Sequence
          key={i}
          from={stepStartFrames[i]}
          durationInFrames={stepDurations[i]}
          name={`Step-${step.stepIndex}`}
        >
          <AbsoluteFill>
            <renderers.GridBoard grid={step.grid} highlights={step.highlights} />

            <renderers.StepIndicator
              currentStep={i}
              totalSteps={data.steps.length}
              annotation={step.annotation}
              description={step.description}
            />

            <renderers.CodeHighlight />

            {data.narration[step.narrationIndex] && (
              <NarrationSubtitle
                segment={data.narration[step.narrationIndex]}
              />
            )}
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* 旁白 TTS 音频 — 独立的顶层 Sequence，跨越该旁白覆盖的所有步骤 */}
      {narrationSequences.map((ns) => {
        const narr = data.narration[ns.narrationIndex];
        if (!narr?.audioUrl) return null;
        return (
          <Sequence
            key={`narr-${ns.narrationIndex}`}
            from={ns.fromFrame}
            durationInFrames={ns.durationFrames}
            name={`Narration-${ns.narrationIndex}`}
          >
            <Audio src={narr.audioUrl} volume={0.85} />
          </Sequence>
        );
      })}

      {/* 背景音乐 */}
      <Audio
        src={staticFile(DEFAULT_BGM)}
        volume={bgmVolume}
        startFrom={0}
      />
    </AbsoluteFill>
    </TemplateThemeProvider>
  );
};
