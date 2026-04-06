import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  SCRIPT_CARD_SYSTEM_PROMPT,
  SCRIPT_LANDSCAPE_SYSTEM_PROMPT,
  buildScriptPrompt,
  videoScriptSchema,
} from "@/lib/prompts/script-prompts";
import { researchTopic } from "@/lib/tavily";
import type { TopicSuggestion } from "@/lib/types/workflow";

const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || "",
});

function extractJSON(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text.trim();
}

/** POST /api/workflow/script — 生成完整文案脚本（支持 Tavily 深度调研） */
export async function POST(req: NextRequest) {
  try {
    const { topic, videoType = "card", userNotes } = (await req.json()) as {
      topic: TopicSuggestion;
      videoType: "card" | "landscape";
      userNotes?: string;
    };

    if (!topic || !topic.title) {
      return NextResponse.json(
        { error: "请提供选题信息" },
        { status: 400 }
      );
    }

    // Mock 模式
    if (
      !process.env.DEEPSEEK_API_KEY ||
      process.env.DEEPSEEK_API_KEY === "your_deepseek_api_key_here"
    ) {
      return NextResponse.json({
        script: getMockScript(topic),
      });
    }

    // ─── Step 1: Tavily 深度调研 ───
    // 用选题标题+关键点构建更精准的搜索 query
    const searchQuery = `${topic.title} ${topic.keyPoints.slice(0, 2).join(" ")} 数据 案例`;
    console.log("[script] 开始 Tavily 深度调研:", searchQuery);

    const research = await researchTopic(searchQuery, {
      maxResults: 8,
      searchDepth: "advanced",
      topic: "general",
    });
    console.log(
      `[script] 调研完成: ${research.sources.length} 条结果`
    );

    // ─── Step 2: 构建 Prompt 并生成文案 ───
    const systemPrompt =
      videoType === "card"
        ? SCRIPT_CARD_SYSTEM_PROMPT
        : SCRIPT_LANDSCAPE_SYSTEM_PROMPT;

    const prompt = buildScriptPrompt(topic, research.formattedContext, userNotes);

    const { text } = await generateText({
      model: deepseek.chat("deepseek-chat"),
      system: systemPrompt,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 4096,
    });

    const jsonStr = extractJSON(text);
    const parsed = JSON.parse(jsonStr);
    const result = videoScriptSchema.safeParse(parsed);

    if (!result.success) {
      console.error("[/api/workflow/script] Zod 校验失败:", JSON.stringify(result.error.issues, null, 2));
      console.error("[/api/workflow/script] AI 原始输出:", text.slice(0, 500));
      // 尝试直接使用 parsed 数据（跳过严格校验）
      if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
        console.warn("[/api/workflow/script] 跳过校验，使用原始数据并补全缺失字段");
        // 自动补全缺失字段
        const patched = {
          title: parsed.title || topic.title,
          subtitle: parsed.subtitle || topic.angle,
          slides: parsed.slides.map((s: Record<string, unknown>, i: number) => ({
            pageIndex: typeof s.pageIndex === "number" ? s.pageIndex : i,
            heading: s.heading || `第 ${i + 1} 页`,
            bodyText: s.bodyText || "",
            narration: s.narration || "",
            visualNote: s.visualNote,
          })),
          style: parsed.style || "dark-tech",
          totalEstimatedDuration: parsed.totalEstimatedDuration || 45,
          endingCTA: parsed.endingCTA || "关注获取更多内容 🔔",
          tags: parsed.tags || topic.tags || [],
        };
        return NextResponse.json({
          script: patched,
          sourcesCount: research.sources.length,
          warning: "部分字段已自动补全",
        });
      }
      return NextResponse.json(
        { error: `文案格式校验失败: ${result.error.issues.map(i => i.message).join(", ")}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      script: result.data,
      sourcesCount: research.sources.length,
    });
  } catch (error) {
    console.error("[/api/workflow/script] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "文案生成失败" },
      { status: 500 }
    );
  }
}

// ─── Mock 脚本 ───

function getMockScript(topic: TopicSuggestion) {
  return {
    title: topic.title,
    subtitle: topic.angle,
    slides: [
      {
        pageIndex: 0,
        heading: `🔥 ${topic.title}`,
        bodyText: topic.hookLine,
        narration: `大家好，今天我们来聊一个很多人都在关注的话题——${topic.title}。`,
        visualNote: "标题页，科技感背景",
      },
      ...topic.keyPoints.slice(0, 3).map((point, i) => ({
        pageIndex: i + 1,
        heading: `要点 ${i + 1}`,
        bodyText: point,
        narration: `第${i + 1}个关键点是：${point}。这对大多数人来说意味着什么呢？`,
        visualNote: "信息图卡片",
      })),
      {
        pageIndex: topic.keyPoints.length + 1,
        heading: "总结",
        bodyText: `以上就是关于「${topic.title}」的核心解读。`,
        narration: `好的，以上就是今天的分享。如果觉得有帮助，别忘了关注我获取更多内容！`,
        visualNote: "结尾 CTA 页",
      },
    ],
    style: "dark-tech",
    totalEstimatedDuration: 45,
    endingCTA: "关注获取更多深度解读 🔔",
    tags: topic.tags,
  };
}
