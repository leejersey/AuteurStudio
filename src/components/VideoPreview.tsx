"use client";

import { useEffect, useState } from "react";
import { SIZES, TIMING } from "@/remotion/styles/theme";
import type { CardVideoData } from "@/lib/types/card-video";
import type { AlgoVideoData } from "@/lib/types/algo-video";
import type { KnowledgeVideoData } from "@/lib/types/landscape-video";
import type { MarkdownVideoData } from "@/lib/types/markdown-video";

interface VideoPreviewProps {
  videoData: CardVideoData | AlgoVideoData | KnowledgeVideoData | MarkdownVideoData | null;
  videoType: "card" | "algo" | "knowledge" | "markdown";
  totalFrames: number;
}

export default function VideoPreview({
  videoData,
  videoType,
  totalFrames,
}: VideoPreviewProps) {
  const isCard = videoType === "card";
  const isLandscape = videoType === "algo" || videoType === "knowledge" || videoType === "markdown";
  const size = isCard ? SIZES.card : SIZES.algo;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [PlayerComponent, setPlayerComponent] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [VideoComponent, setVideoComponent] = useState<any>(null);

  useEffect(() => {
    // 动态加载 Remotion Player（避免 SSR）
    import("@remotion/player").then((mod) => {
      setPlayerComponent(() => mod.Player);
    });
  }, []);

  useEffect(() => {
    // 切换模式时立即清空旧组件，防止旧组件用新数据渲染
    setVideoComponent(null);

    if (videoType === "card") {
      import("@/remotion/compositions/CardVideo").then((mod) => {
        setVideoComponent(() => mod.CardVideo);
      });
    } else if (videoType === "algo") {
      import("@/remotion/compositions/AlgoVideo").then((mod) => {
        setVideoComponent(() => mod.AlgoVideo);
      });
    } else if (videoType === "knowledge") {
      import("@/remotion/compositions/KnowledgeVideo").then((mod) => {
        setVideoComponent(() => mod.KnowledgeVideo);
      });
    } else if (videoType === "markdown") {
      import("@/remotion/compositions/MarkdownVideo").then((mod) => {
        setVideoComponent(() => mod.MarkdownVideo);
      });
    }
  }, [videoType]);

  if (!videoData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="relative aspect-[9/16] h-full max-h-[750px] w-full max-w-md bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 border border-outline-variant/20 mx-auto flex items-center justify-center">
          <div className="text-center p-12">
            <span className="material-symbols-outlined text-6xl text-primary/20 mb-6 block">
              movie_creation
            </span>
            <p className="text-on-surface-variant/50 text-sm mb-2">
              视频预览区
            </p>
            <p className="text-on-surface-variant/30 text-xs">
              在左侧对话中输入内容后，AI 将自动生成视频
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!PlayerComponent || !VideoComponent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary animate-spin">
          sync
        </span>
        <span className="ml-2 text-sm text-on-surface-variant">
          加载播放器...
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
      <div
        className={`relative ${
          isCard
            ? "aspect-[9/16] max-h-[750px] max-w-md"
            : "aspect-video max-h-[600px] max-w-4xl"
        } w-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 border border-outline-variant/20 mx-auto`}
      >
        <PlayerComponent
          component={VideoComponent}
          inputProps={{ data: videoData }}
          durationInFrames={Math.max(totalFrames, 1)}
          fps={TIMING.fps}
          compositionWidth={size.width}
          compositionHeight={size.height}
          style={{ width: "100%", height: "100%" }}
          controls
          autoPlay={false}
          loop
        />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          {isCard ? "9:16 竖屏" : "16:9 横屏"} • {TIMING.fps}fps •{" "}
          {Math.round(totalFrames / TIMING.fps)}秒
          {videoType === "markdown" && " • Markdown"}
        </span>
      </div>
    </div>
  );
}
