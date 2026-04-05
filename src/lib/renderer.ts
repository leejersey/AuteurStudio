// Remotion 服务端渲染封装
// 注意：仅限本地开发环境使用，生产环境请使用 Remotion Lambda

import path from "path";

// ─── 视频类型 → CompositionId 映射 ───

export type VideoType = "card" | "algo" | "knowledge" | "markdown";
export type CompositionId = "CardVideo" | "AlgoVideo" | "KnowledgeVideo" | "MarkdownVideo";

export function getCompositionId(videoType: VideoType): CompositionId {
  switch (videoType) {
    case "card":
      return "CardVideo";
    case "algo":
      return "AlgoVideo";
    case "knowledge":
      return "KnowledgeVideo";
    case "markdown":
      return "MarkdownVideo";
    default:
      return "CardVideo";
  }
}

interface RenderConfig {
  compositionId: CompositionId;
  inputProps: Record<string, unknown>;
  outputDir?: string;
}

interface RenderResult {
  outputPath: string;
  durationMs: number;
}

export async function renderVideo(
  config: RenderConfig,
  onProgress?: (progress: number) => void
): Promise<RenderResult> {
  const startTime = Date.now();

  // 动态导入避免在客户端打包
  const renderer = await import("@remotion/renderer");
  const { bundle } = await import("@remotion/bundler");

  // Bundle Remotion 项目
  const bundleLocation = await bundle({
    entryPoint: path.resolve(process.cwd(), "src/remotion/index.tsx"),
  });

  const outputDir =
    config.outputDir || path.resolve(process.cwd(), "public/renders");
  const outputFileName = `${config.compositionId}_${Date.now()}.mp4`;
  const outputPath = path.join(outputDir, outputFileName);

  // 确保输出目录存在
  const fs = await import("fs/promises");
  await fs.mkdir(outputDir, { recursive: true });

  // 获取 composition 的元数据
  const compositions = await renderer.getCompositions(bundleLocation, {
    inputProps: config.inputProps,
  });
  const composition = compositions.find((c) => c.id === config.compositionId);

  if (!composition) {
    throw new Error(`Composition "${config.compositionId}" 未找到`);
  }

  await renderer.renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: config.inputProps,
    onProgress: ({ progress }) => {
      onProgress?.(Math.round(progress * 100));
    },
  });

  return {
    outputPath: `/renders/${outputFileName}`,
    durationMs: Date.now() - startTime,
  };
}

