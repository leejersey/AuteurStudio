import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/volcengine-tts";
import { saveProject, createProjectFromVideoData } from "@/lib/project-store";
import type { VideoScript } from "@/lib/types/workflow";

// 从文本长度估算朗读时长（中文 ~4 字/秒）
function estimateDurationMs(text: string): number {
  const charsPerSec = 4;
  return Math.max(3000, Math.ceil((text.length / charsPerSec) * 1000) + 500);
}

/** POST /api/workflow/video — 从确认的脚本生成视频数据 */
export async function POST(req: NextRequest) {
  try {
    const { script, videoType = "card", templateId } = (await req.json()) as {
      script: VideoScript;
      videoType: "card" | "landscape";
      templateId?: string;
    };

    if (!script || !script.slides || script.slides.length === 0) {
      return NextResponse.json(
        { error: "请提供确认的脚本" },
        { status: 400 }
      );
    }

    // ─── 将 VideoScript 转为视频引擎需要的 VideoData ───

    let videoData: Record<string, unknown>;
    let resolvedVideoType: "card" | "algo" | "knowledge";

    if (videoType === "card") {
      resolvedVideoType = "card";
      videoData = convertToCardVideoData(script);
    } else {
      resolvedVideoType = "knowledge";
      videoData = convertToKnowledgeVideoData(script);
    }

    // ─── TTS 合成旁白 ───
    const narrations = script.slides.map((slide) => ({
      text: slide.narration,
      durationMs: undefined as number | undefined,
      audioUrl: undefined as string | undefined,
    }));

    console.log(`[TTS] 开始为 ${narrations.length} 段旁白合成语音...`);
    let succeeded = 0;

    for (let i = 0; i < narrations.length; i++) {
      const seg = narrations[i];
      try {
        const { audioBuffer } = await synthesizeSpeech(seg.text);
        const base64 = audioBuffer.toString("base64");
        seg.audioUrl = `data:audio/mp3;base64,${base64}`;
        const estimatedSec = audioBuffer.length / 16000;
        seg.durationMs = Math.max(3000, Math.ceil(estimatedSec * 1000));
        succeeded++;
      } catch {
        seg.durationMs = estimateDurationMs(seg.text);
      }

      if (i < narrations.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    console.log(`[TTS] 合成完成: ${succeeded}/${narrations.length} 成功`);

    // 将 TTS 结果注入 videoData
    if (resolvedVideoType === "card" && "slides" in videoData) {
      // card type 不直接有 narration，但我们存储在 meta 中
    }
    videoData.narration = narrations;

    // 将 templateId 写入 meta
    if (templateId && videoData.meta && typeof videoData.meta === "object") {
      (videoData.meta as Record<string, unknown>).templateId = templateId;
    }

    // ─── 保存项目 ───
    const project = createProjectFromVideoData(
      videoData,
      resolvedVideoType,
      script.title
    );
    await saveProject(project);

    return NextResponse.json({
      videoData,
      videoType: resolvedVideoType,
      projectId: project.id,
    });
  } catch (error) {
    console.error("[/api/workflow/video] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "视频生成失败" },
      { status: 500 }
    );
  }
}

// ─── 脚本 → CardVideoData 格式转换 ───

function convertToCardVideoData(script: VideoScript): Record<string, unknown> {
  const slides = script.slides.map((slide, i) => {
    if (i === 0) {
      return {
        type: "title" as const,
        category: script.tags[0] || "资讯",
        heading: slide.heading,
        subtitle: slide.bodyText,
        highlightWords: extractHighlightWords(slide.heading),
      };
    }

    if (i === script.slides.length - 1) {
      return {
        type: "ending" as const,
        authorName: "创作者",
        callToAction: script.endingCTA,
        tags: script.tags,
      };
    }

    // 中间页 → numbered_list 类型
    return {
      type: "numbered_list" as const,
      heading: slide.heading,
      items: slide.bodyText.split(/[。！？\n]/).filter(Boolean).map((text) => ({
        text: text.trim(),
        detail: undefined,
      })),
      tags: script.tags.slice(0, 2),
    };
  });

  return {
    meta: {
      title: script.title,
      category: script.tags[0] || "资讯",
      style: (script.style || "dark-tech") as "dark-tech",
      aspectRatio: "9:16" as const,
    },
    slides,
  };
}

// ─── 脚本 → KnowledgeVideoData 格式转换 ───

function convertToKnowledgeVideoData(
  script: VideoScript
): Record<string, unknown> {
  return {
    meta: {
      title: script.title,
      category: script.tags[0] || "知识",
      aspectRatio: "16:9" as const,
    },
    slides: script.slides.map((slide, i) => ({
      slideIndex: i,
      heading: slide.heading,
      bodyText: slide.bodyText,
      visualType: i === 0 ? "title" : i === script.slides.length - 1 ? "summary" : "info",
    })),
    narration: script.slides.map((slide) => ({
      text: slide.narration,
      durationMs: estimateDurationMs(slide.narration),
    })),
  };
}

// ─── 辅助：提取高亮词 ───

function extractHighlightWords(text: string): string[] {
  const cleaned = text.replace(/[🔥💰📊🚀⚡️✨🎯]/g, "").trim();
  const words = cleaned.split(/\s+/);
  return words.filter((w) => w.length >= 2).slice(0, 3);
}
