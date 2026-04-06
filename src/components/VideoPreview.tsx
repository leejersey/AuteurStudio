"use client";

import { useEffect, useState, useMemo } from "react";
import { SIZES, TIMING } from "@/remotion/styles/theme";
import type { CardVideoData } from "@/lib/types/card-video";
import type { AlgoVideoData } from "@/lib/types/algo-video";
import type { KnowledgeVideoData } from "@/lib/types/landscape-video";
import type { MarkdownVideoData } from "@/lib/types/markdown-video";
import type { DeepPartial, TemplateTheme } from "@/remotion/template-theme";

interface VideoPreviewProps {
  videoData: CardVideoData | AlgoVideoData | KnowledgeVideoData | MarkdownVideoData | null;
  videoType: "card" | "algo" | "knowledge" | "markdown";
  totalFrames: number;
  /** 迭代二：模板设置面板产生的 theme 覆盖 */
  themeOverrides?: DeepPartial<TemplateTheme>;
}

export default function VideoPreview({
  videoData,
  videoType,
  totalFrames,
  themeOverrides,
}: VideoPreviewProps) {
  const isCard = videoType === "card";
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

    // 触发模板注册（side-effect import），然后加载对应 Composition
    const loadTemplates = Promise.all([
      import("@/remotion/template-packs/dark-tech"),
      import("@/remotion/template-packs/minimal-white"),
    ]);

    if (videoType === "card") {
      loadTemplates.then(() =>
        import("@/remotion/compositions/CardVideo").then((mod) => {
          setVideoComponent(() => mod.CardVideo);
        })
      );
    } else if (videoType === "algo") {
      loadTemplates.then(() =>
        import("@/remotion/compositions/AlgoVideo").then((mod) => {
          setVideoComponent(() => mod.AlgoVideo);
        })
      );
    } else if (videoType === "knowledge") {
      loadTemplates.then(() =>
        import("@/remotion/compositions/KnowledgeVideo").then((mod) => {
          setVideoComponent(() => mod.KnowledgeVideo);
        })
      );
    } else if (videoType === "markdown") {
      loadTemplates.then(() =>
        import("@/remotion/compositions/MarkdownVideo").then((mod) => {
          setVideoComponent(() => mod.MarkdownVideo);
        })
      );
    }
  }, [videoType]);

  // 将 themeOverrides 合并到 videoData 的 meta 中，传给 Remotion Player
  const enrichedInputProps = useMemo(() => {
    if (!videoData) return { data: videoData };

    // 如果有 themeOverrides，注入到 data.meta.themeOverrides
    if (themeOverrides && Object.keys(themeOverrides).length > 0 && "meta" in videoData) {
      const cloned = JSON.parse(JSON.stringify(videoData));
      cloned.meta = { ...cloned.meta, themeOverrides };
      return { data: cloned };
    }

    return { data: videoData };
  }, [videoData, themeOverrides]);

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
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative min-h-0">
      <div
        className={`relative ${
          isCard
            ? "aspect-[9/16] max-h-[750px] max-w-md"
            : "aspect-video max-h-[600px] max-w-4xl"
        } w-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 border border-outline-variant/20 mx-auto`}
      >
        <style>{`
          .remotion-player-play-button,
          button[aria-label="Play video"],
          button[aria-label="Pause video"],
          button[title="Fullscreen"],
          button[title="Exit fullscreen"] {
            outline: none !important;
          }
          :root {
            --remotion-player-outline-color: transparent;
          }
        `}</style>
        <PlayerComponent
          component={VideoComponent}
          inputProps={enrichedInputProps}
          durationInFrames={Math.max(totalFrames, 1)}
          fps={TIMING.fps}
          compositionWidth={size.width}
          compositionHeight={size.height}
          style={{ width: "100%", height: "100%" }}
          controls
          autoPlay={false}
          loop
          renderPlayPauseButton={({ playing }: { playing: boolean }) => (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 backdrop-blur-sm mr-2 cursor-pointer">
              <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
                {playing ? 'pause' : 'play_arrow'}
              </span>
            </div>
          )}
          renderFullscreenButton={({ isFullscreen }: { isFullscreen: boolean }) => (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer ml-2">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </div>
          )}
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
