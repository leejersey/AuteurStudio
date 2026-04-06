import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/volcengine-tts";
import { saveProject, createProjectFromVideoData } from "@/lib/project-store";
import { enrichSlidesWithImages } from "@/lib/unsplash";
import type { VideoScript } from "@/lib/types/workflow";

// 从文本长度估算朗读时长（中文 ~4 字/秒）
function estimateDurationMs(text: string): number {
  const charsPerSec = 4;
  return Math.max(3000, Math.ceil((text.length / charsPerSec) * 1000) + 500);
}

/** POST /api/workflow/video — 从确认的脚本生成视频数据 */
export async function POST(req: NextRequest) {
  try {
    const { script, videoType = "card", templateId, voiceId, voiceSpeed } = (await req.json()) as {
      script: VideoScript;
      videoType: "card" | "landscape";
      templateId?: string;
      voiceId?: string;
      voiceSpeed?: number;
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
        const { audioBuffer } = await synthesizeSpeech(
          seg.text,
          voiceId || "BV700_streaming",
          voiceSpeed || 1.0
        );
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

    // ─── Unsplash 配图 ───
    if (Array.isArray(videoData.slides)) {
      console.log("[Unsplash] 开始为 slides 获取配图...");
      videoData.slides = await enrichSlidesWithImages(
        videoData.slides as Array<{ imageKeyword?: string; imageUrl?: string; imageCredit?: string }>
      );
      console.log("[Unsplash] 配图获取完成");
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
    // 从 heading 提取搜索关键词
    const imageKeyword = extractImageKeyword(slide.heading, slide.bodyText);

    if (i === 0) {
      return {
        type: "title" as const,
        category: script.tags[0] || "资讯",
        heading: slide.heading,
        subtitle: slide.bodyText,
        highlightWords: extractHighlightWords(slide.heading),
        imageKeyword,
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
      imageKeyword,
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
// 必须生成 LandscapeSlide 格式 (landscape_title/landscape_content/landscape_ending)
// 每个 slide 需要 narrationIndex 指向 narration 数组中对应的旁白段

function convertToKnowledgeVideoData(
  script: VideoScript
): Record<string, unknown> {
  // 预定义每页的图标，让内容更生动
  const contentIcons = ["💡", "🔍", "⚙️", "📊", "🚀", "🎯", "🔬", "📌", "✨", "🧠"];

  const slides = script.slides.map((slide, i) => {
    const imageKeyword = extractImageKeyword(slide.heading, slide.bodyText);

    // 第一页 → landscape_title
    if (i === 0) {
      return {
        type: "landscape_title" as const,
        heading: slide.heading.replace(/[🔥💰📊🚀⚡️✨🎯Hook：：]/g, "").trim(),
        subtitle: slide.bodyText.slice(0, 60),
        tags: script.tags?.slice(0, 3),
        narrationIndex: i,
        imageKeyword,
      };
    }

    // 最后一页 → landscape_ending
    if (i === script.slides.length - 1) {
      return {
        type: "landscape_ending" as const,
        heading: slide.heading,
        summary: slide.bodyText,
        keyTakeaways: slide.bodyText
          .split(/[。！？\n]/)
          .filter((s) => s.trim().length > 5)
          .slice(0, 3),
        callToAction: script.endingCTA,
        narrationIndex: i,
        imageKeyword,
      };
    }

    // 中间页 → landscape_content
    const sentences = slide.bodyText
      .split(/[。！？\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 3);

    // 限制 points 最多 4 个，防止内容溢出视频画面
    const MAX_POINTS = 4;
    const MAX_POINT_LENGTH = 50; // 每条最多 50 字

    let trimmedSentences = sentences.length > 0 ? sentences : [slide.bodyText];

    // 如果超过 4 条，截断
    if (trimmedSentences.length > MAX_POINTS) {
      trimmedSentences = trimmedSentences.slice(0, MAX_POINTS);
    }

    // 限制每条文本长度
    trimmedSentences = trimmedSentences.map((s) =>
      s.length > MAX_POINT_LENGTH ? s.slice(0, MAX_POINT_LENGTH) + "…" : s
    );

    return {
      type: "landscape_content" as const,
      heading: slide.heading,
      points: trimmedSentences.map((text, j) => ({
            icon: contentIcons[(i + j) % contentIcons.length],
            text,
            detail: undefined,
          })),
      narrationIndex: i,
      imageKeyword,
    };
  });

  return {
    meta: {
      title: script.title,
      category: script.tags?.[0] || "知识",
      style: "dark-tech" as const,
      aspectRatio: "16:9" as const,
      contentType: "knowledge" as const,
    },
    slides,
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

// ─── 辅助：从标题/正文提取图片搜索关键词 ───

function extractImageKeyword(heading: string, bodyText: string): string {
  // 中文标题 → 英文关键词的简单映射
  const keywordMap: Record<string, string> = {
    "AI": "artificial intelligence",
    "人工智能": "artificial intelligence",
    "机器学习": "machine learning neural network",
    "深度学习": "deep learning neural network",
    "大模型": "large language model AI",
    "LLM": "large language model",
    "GPT": "artificial intelligence chatbot",
    "RAG": "data retrieval knowledge base",
    "检索": "search engine data retrieval",
    "知识库": "knowledge database library",
    "向量": "vector database abstract",
    "数据": "data analytics visualization",
    "算法": "algorithm code programming",
    "编程": "programming code developer",
    "技术": "technology innovation digital",
    "科技": "technology futuristic digital",
    "区块链": "blockchain cryptocurrency",
    "云计算": "cloud computing server",
    "量子": "quantum computing physics",
    "安全": "cybersecurity protection shield",
    "医疗": "medical healthcare technology",
    "教育": "education learning classroom",
    "金融": "finance trading stock market",
    "自动驾驶": "autonomous driving car",
    "机器人": "robot automation",
  };

  const combined = `${heading} ${bodyText}`;
  const matched: string[] = [];

  for (const [cn, en] of Object.entries(keywordMap)) {
    if (combined.includes(cn)) {
      matched.push(en);
      if (matched.length >= 2) break;
    }
  }

  if (matched.length > 0) return matched.join(" ");

  // fallback: 用标题清理后的关键词
  return "technology abstract futuristic";
}
