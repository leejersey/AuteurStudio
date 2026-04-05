"use client";

import { useState, useCallback } from "react";
import type { CardVideoData } from "@/lib/types/card-video";
import type { AlgoVideoData } from "@/lib/types/algo-video";
import type { KnowledgeVideoData } from "@/lib/types/landscape-video";
import type { MarkdownVideoData } from "@/lib/types/markdown-video";

type VideoData = CardVideoData | AlgoVideoData | KnowledgeVideoData | MarkdownVideoData | null;

// 从文本估算时长 (与服务端保持一致)
function estimateDurationMs(text: string): number {
  return Math.max(3000, Math.ceil((text.length / 4) * 1000) + 500);
}

// 计算算法视频总帧数
function calcAlgoTotalFrames(data: AlgoVideoData): number {
  const fps = 30;
  const MIN_STEP_FRAMES = 3 * fps;

  const narrationStepCount: Record<number, number> = {};
  data.steps.forEach((step) => {
    narrationStepCount[step.narrationIndex] =
      (narrationStepCount[step.narrationIndex] || 0) + 1;
  });

  let total = 0;
  data.steps.forEach((step) => {
    const narr = data.narration[step.narrationIndex];
    const durationMs = narr?.durationMs || estimateDurationMs(narr?.text || "");
    const sharedCount = narrationStepCount[step.narrationIndex] || 1;
    const perStepMs = durationMs / sharedCount;
    const frames = Math.ceil((perStepMs / 1000) * fps);
    total += Math.max(MIN_STEP_FRAMES, frames);
  });

  return total;
}

// 计算知识讲解视频总帧数
function calcKnowledgeTotalFrames(data: KnowledgeVideoData): number {
  const fps = 30;
  const MIN_SLIDE_FRAMES = 4 * fps;

  let total = 0;
  data.slides.forEach((slide) => {
    const narr = data.narration[slide.narrationIndex];
    const durationMs = narr?.durationMs || estimateDurationMs(narr?.text || "");
    const frames = Math.ceil((durationMs / 1000) * fps);
    total += Math.max(MIN_SLIDE_FRAMES, frames);
  });

  return total;
}

// 计算 Markdown 视频总帧数
function calcMarkdownTotalFrames(data: MarkdownVideoData): number {
  const fps = 30;
  const MIN_SLIDE_FRAMES = 4 * fps;
  const MIN_CODE_FRAMES = 6 * fps;

  let total = 0;
  data.slides.forEach((slide) => {
    const narr = data.narration[slide.narrationIndex];
    const baseDurationMs = narr?.durationMs || estimateDurationMs(narr?.text || "");
    const baseFrames = Math.ceil((baseDurationMs / 1000) * fps);

    if (slide.type === "md_code") {
      const extraCodeFrames = Math.ceil((slide.lines.length / 10) * 2 * fps);
      total += Math.max(MIN_CODE_FRAMES, baseFrames + extraCodeFrames);
    } else {
      total += Math.max(MIN_SLIDE_FRAMES, baseFrames);
    }
  });

  return total;
}

// 带 narration 的 card 视频帧数
function calcCardWithNarrationFrames(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): number {
  const fps = 30;
  const MIN_SLIDE_FRAMES = 4 * fps;

  const narrations = data.narration as Array<{
    text: string;
    durationMs?: number;
  }>;

  if (!narrations || narrations.length === 0) {
    const slideCount = data.slides?.length || 1;
    return slideCount * 4 * fps;
  }

  let total = 0;
  for (const narr of narrations) {
    const durationMs = narr.durationMs || estimateDurationMs(narr.text || "");
    const frames = Math.ceil((durationMs / 1000) * fps);
    total += Math.max(MIN_SLIDE_FRAMES, frames);
  }

  return total;
}

export function useVideoData() {
  const [videoData, setVideoData] = useState<VideoData>(null);
  const [videoType, setVideoType] = useState<"card" | "algo" | "knowledge" | "markdown">("card");

  const updateVideoData = useCallback(
    (data: unknown, type?: string) => {
      if (!data) return;
      setVideoData(data as VideoData);
      if (type === "card" || type === "algo" || type === "knowledge" || type === "markdown") {
        setVideoType(type);
      }
    },
    []
  );

  const clearVideoData = useCallback(() => {
    setVideoData(null);
  }, []);

  // 计算视频总时长（帧数）
  const totalFrames = (() => {
    if (!videoData) return 120;
    const fps = 30;

    // Markdown 视频
    if (videoType === "markdown" && "slides" in videoData && "meta" in videoData) {
      const meta = (videoData as MarkdownVideoData).meta;
      if ("codeTheme" in meta) {
        return calcMarkdownTotalFrames(videoData as MarkdownVideoData);
      }
    }

    // Card 视频
    if (videoType === "card" && "slides" in videoData) {
      if ("narration" in videoData) {
        return calcCardWithNarrationFrames(videoData);
      }
      return (videoData as CardVideoData).slides.length * 4 * fps;
    }

    // Algo 算法视频
    if (videoType === "algo" && "steps" in videoData) {
      return calcAlgoTotalFrames(videoData as AlgoVideoData);
    }

    // Knowledge 知识讲解视频
    if (videoType === "knowledge" && "slides" in videoData && "narration" in videoData) {
      return calcKnowledgeTotalFrames(videoData as KnowledgeVideoData);
    }

    return 120;
  })();

  return {
    videoData,
    videoType,
    totalFrames,
    updateVideoData,
    clearVideoData,
  };
}
