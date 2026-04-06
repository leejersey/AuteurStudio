import { NextRequest, NextResponse } from "next/server";
import {
  generateCardVideoData,
  generateLandscapeVideoData,
} from "@/lib/deepseek";
import { synthesizeSpeech } from "@/lib/volcengine-tts";
import { saveProject, createProjectFromVideoData } from "@/lib/project-store";
import { enrichSlidesWithImages } from "@/lib/unsplash";

// 从文本长度估算朗读时长（中文 ~4 字/秒）
function estimateDurationMs(text: string): number {
  const charsPerSec = 4;
  return Math.max(3000, Math.ceil((text.length / charsPerSec) * 1000) + 500);
}

// 为旁白文本批量合成 TTS 语音（串行 + 限流，避免 429）
async function synthesizeNarrations(
  narrations: { text: string; durationMs?: number; audioUrl?: string }[]
): Promise<void> {
  console.log(`[TTS] 开始为 ${narrations.length} 段旁白合成语音...`);

  let succeeded = 0;

  for (let i = 0; i < narrations.length; i++) {
    const seg = narrations[i];
    try {
      const { audioBuffer } = await synthesizeSpeech(seg.text);
      const base64 = audioBuffer.toString("base64");
      seg.audioUrl = `data:audio/mp3;base64,${base64}`;

      // 从 MP3 buffer 估算时长（128kbps = 16000 bytes/sec）
      const estimatedSec = audioBuffer.length / 16000;
      seg.durationMs = Math.max(3000, Math.ceil(estimatedSec * 1000));

      succeeded++;
      console.log(`[TTS] 旁白 ${i + 1}/${narrations.length} 合成成功 (~${(seg.durationMs / 1000).toFixed(1)}s, ${seg.text.slice(0, 20)}...)`);
    } catch (err) {
      console.error(`[TTS] 旁白 ${i + 1} 合成失败:`, err instanceof Error ? err.message : err);
      // 失败时用文本长度估算
      seg.durationMs = estimateDurationMs(seg.text);
    }

    // 限流：每次请求间隔 300ms
    if (i < narrations.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // 确保所有 narration 都有 durationMs
  narrations.forEach((seg) => {
    if (!seg.durationMs) {
      seg.durationMs = estimateDurationMs(seg.text);
    }
  });

  console.log(`[TTS] 合成完成: ${succeeded}/${narrations.length} 成功`);
}

export async function POST(req: NextRequest) {
  try {
    const { message, videoType = "card" } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "请提供有效的消息内容" },
        { status: 400 }
      );
    }

    // 检查 API Key
    if (
      !process.env.DEEPSEEK_API_KEY ||
      process.env.DEEPSEEK_API_KEY === "your_deepseek_api_key_here"
    ) {
      // Mock 模式：返回示例数据
      return NextResponse.json({
        reply: `[Mock 模式] 收到您的请求：「${message}」。请在 .env.local 中配置 DEEPSEEK_API_KEY 以启用真实 AI 生成。`,
        videoData: getMockVideoData(videoType),
        videoType,
      });
    }

    if (videoType === "landscape") {
      const { videoData, contentType } = await generateLandscapeVideoData(message);

      // 为旁白合成 TTS 语音
      await synthesizeNarrations(videoData.narration);

      // 为 slides 获取配图
      if ("slides" in videoData && Array.isArray(videoData.slides)) {
        console.log("[Unsplash] 开始为横屏视频 slides 获取配图...");
        videoData.slides = await enrichSlidesWithImages(videoData.slides);
        console.log("[Unsplash] 配图获取完成");
      }

      const isAlgo = contentType === "algorithm";
      const resolvedVideoType = isAlgo ? "algo" : "knowledge";
      const stepsInfo = isAlgo && "steps" in videoData ? `${videoData.steps.length} 个动画步骤` : `${("slides" in videoData ? videoData.slides.length : 0)} 页`;

      // 自动保存项目
      const project = createProjectFromVideoData(
        videoData as unknown as Record<string, unknown>,
        resolvedVideoType as "algo" | "knowledge",
        message
      );
      await saveProject(project);

      return NextResponse.json({
        reply: `已为您生成横屏视频「${videoData.meta.title}」，包含 ${stepsInfo}。您可以在右侧预览面板查看效果。`,
        videoData,
        videoType: resolvedVideoType,
        projectId: project.id,
      });
    }

    // 默认：图文卡片视频
    const { videoData } = await generateCardVideoData(message);

    // 为 slides 获取配图
    console.log("[Unsplash] 开始为卡片视频 slides 获取配图...");
    videoData.slides = await enrichSlidesWithImages(videoData.slides);
    console.log("[Unsplash] 配图获取完成");

    // 自动保存项目
    const project = createProjectFromVideoData(
      videoData as unknown as Record<string, unknown>,
      "card",
      message
    );
    await saveProject(project);

    return NextResponse.json({
      reply: `已为您生成图文视频「${videoData.meta.title}」，共 ${videoData.slides.length} 页。您可以在右侧预览或继续对话修改。`,
      videoData,
      videoType: "card",
      projectId: project.id,
    });
  } catch (error) {
    console.error("[/api/chat] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "AI 生成过程发生未知错误",
      },
      { status: 500 }
    );
  }
}

// ─── Mock 数据（无 API Key 时使用）───

function getMockVideoData(videoType: string) {
  if (videoType === "algo") {
    return {
      meta: {
        title: "为什么腐烂橘子需要4分钟？",
        algorithm: "BFS",
        aspectRatio: "16:9" as const,
        difficulty: "中等",
      },
      narration: [
        { text: "今天我们来看一道经典的 BFS 题目——腐烂的橘子。", durationMs: 4000 },
        { text: "首先，我们找到所有初始腐烂的橘子，把它们加入队列。", durationMs: 5000 },
        { text: "然后，每一轮 BFS 扩展，相邻的新鲜橘子会变成腐烂的。", durationMs: 5000 },
      ],
      steps: [
        {
          stepIndex: 0,
          description: "初始化网格",
          grid: [
            [{ value: 2, state: "rotten" as const }, { value: 1, state: "fresh" as const }, { value: 1, state: "fresh" as const }],
            [{ value: 1, state: "fresh" as const }, { value: 1, state: "fresh" as const }, { value: 0, state: "empty" as const }],
            [{ value: 0, state: "empty" as const }, { value: 1, state: "fresh" as const }, { value: 1, state: "fresh" as const }],
          ],
          highlights: [[0, 0]] as [number, number][],
          annotation: "初始状态",
          narrationIndex: 0,
        },
        {
          stepIndex: 1,
          description: "第 1 分钟：腐烂扩散至 (0,1) 和 (1,0)",
          grid: [
            [{ value: 2, state: "rotten" as const }, { value: 2, state: "just_rotten" as const }, { value: 1, state: "fresh" as const }],
            [{ value: 2, state: "just_rotten" as const }, { value: 1, state: "fresh" as const }, { value: 0, state: "empty" as const }],
            [{ value: 0, state: "empty" as const }, { value: 1, state: "fresh" as const }, { value: 1, state: "fresh" as const }],
          ],
          highlights: [[0, 1], [1, 0]] as [number, number][],
          annotation: "第 1 分钟",
          narrationIndex: 1,
        },
        {
          stepIndex: 2,
          description: "第 2 分钟：继续扩散",
          grid: [
            [{ value: 2, state: "rotten" as const }, { value: 2, state: "rotten" as const }, { value: 2, state: "just_rotten" as const }],
            [{ value: 2, state: "rotten" as const }, { value: 2, state: "just_rotten" as const }, { value: 0, state: "empty" as const }],
            [{ value: 0, state: "empty" as const }, { value: 1, state: "fresh" as const }, { value: 1, state: "fresh" as const }],
          ],
          highlights: [[0, 2], [1, 1]] as [number, number][],
          annotation: "第 2 分钟",
          narrationIndex: 2,
        },
      ],
    };
  }

  return {
    meta: {
      title: "Codex 定价大地震",
      category: "AI资讯",
      style: "dark-tech" as const,
      aspectRatio: "9:16" as const,
    },
    slides: [
      {
        type: "title" as const,
        category: "AI资讯",
        heading: "🔥 Codex 定价大地震",
        subtitle: "4.0 版本发布后你必须知道的事",
        highlightWords: ["定价", "大地震"],
      },
      {
        type: "numbered_list" as const,
        heading: "三大关键变化",
        items: [
          { text: "💰 API 价格下调 50%", detail: "适用于所有 chat 模型" },
          { text: "📊 新增 token 计量方式", detail: "按实际消耗计费" },
          { text: "🚀 批量调用折扣", detail: "月调用量 > 100M 可申请" },
        ],
        tags: ["PLUS用户必看", "开发者福利"],
      },
      {
        type: "comparison" as const,
        heading: "老方案 vs 新方案",
        left: {
          title: "旧版定价",
          items: [
            { text: "$30/1M tokens (输入)", positive: false },
            { text: "$60/1M tokens (输出)", positive: false },
          ],
        },
        right: {
          title: "新版定价",
          items: [
            { text: "$15/1M tokens (输入)", positive: true },
            { text: "$30/1M tokens (输出)", positive: true },
          ],
        },
      },
      {
        type: "ending" as const,
        authorName: "创作者",
        callToAction: "关注获取更多 AI 资讯 🔔",
        tags: ["AI", "Codex", "定价"],
      },
    ],
  };
}
