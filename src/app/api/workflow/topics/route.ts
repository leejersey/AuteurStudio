import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  TOPIC_GENERATION_SYSTEM_PROMPT,
  buildTopicPrompt,
  topicResponseSchema,
} from "@/lib/prompts/topic-prompts";
import { researchTopic } from "@/lib/tavily";

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

/** POST /api/workflow/topics — 生成选题建议（支持 Tavily 调研） */
export async function POST(req: NextRequest) {
  try {
    const { intent, videoType = "card" } = await req.json();

    if (!intent || typeof intent !== "string") {
      return NextResponse.json(
        { error: "请提供创意方向" },
        { status: 400 }
      );
    }

    // Mock 模式
    if (
      !process.env.DEEPSEEK_API_KEY ||
      process.env.DEEPSEEK_API_KEY === "your_deepseek_api_key_here"
    ) {
      return NextResponse.json({
        topics: getMockTopics(intent),
      });
    }

    // ─── Step 1: Tavily 调研 ───
    console.log("[topics] 开始 Tavily 调研:", intent);
    const research = await researchTopic(intent, {
      maxResults: 5,
      searchDepth: "advanced",
      topic: "general",
    });
    console.log(
      `[topics] 调研完成: ${research.sources.length} 条结果, 摘要长度: ${research.summary.length}`
    );

    // ─── Step 2: 构建 Prompt 并生成选题 ───
    const prompt = buildTopicPrompt(intent, videoType, research.formattedContext);

    const { text } = await generateText({
      model: deepseek.chat("deepseek-chat"),
      system: TOPIC_GENERATION_SYSTEM_PROMPT,
      prompt,
      temperature: 0.8,
      maxOutputTokens: 2048,
    });

    const jsonStr = extractJSON(text);
    const parsed = JSON.parse(jsonStr);
    const validated = topicResponseSchema.parse(parsed);

    return NextResponse.json({
      topics: validated.topics,
      // 附带调研摘要，前端可展示
      researchSummary: research.summary || undefined,
      sourcesCount: research.sources.length,
    });
  } catch (error) {
    console.error("[/api/workflow/topics] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "选题生成失败" },
      { status: 500 }
    );
  }
}

// ─── Mock 选题 ───

function getMockTopics(intent: string) {
  return [
    {
      id: "topic_1",
      title: "价格腰斩的真相",
      angle: "从开发者钱包出发，算一笔经济账",
      targetAudience: "AI开发者、独立开发者",
      hookLine: "你的 API 账单可能即将减半，但代价是什么？",
      keyPoints: ["新旧价格对比", "隐藏限制条款", "真实成本计算"],
      estimatedDuration: "45秒",
      tags: ["AI", "成本分析"],
    },
    {
      id: "topic_2",
      title: "三分钟看懂全貌",
      angle: "小白友好的科普视角",
      targetAudience: "科技爱好者、产品经理",
      hookLine: `关于「${intent.slice(0, 10)}」，90%的人只看到了表面`,
      keyPoints: ["是什么", "为什么重要", "对你的影响"],
      estimatedDuration: "60秒",
      tags: ["科普", "入门"],
    },
    {
      id: "topic_3",
      title: "行业深度对比",
      angle: "横向对比竞品，找出最优解",
      targetAudience: "决策者、技术管理者",
      hookLine: "我对比了 5 个方案，结论出乎意料",
      keyPoints: ["竞品列表", "核心差异点", "选择建议"],
      estimatedDuration: "50秒",
      tags: ["对比", "深度"],
    },
  ];
}
