import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { cardVideoSchema } from "@/lib/prompts/card-video";
import { algoVideoSchema } from "@/lib/prompts/algo-video";
import { CARD_VIDEO_SYSTEM_PROMPT } from "@/lib/prompts/card-video";
import { ALGO_VIDEO_SYSTEM_PROMPT } from "@/lib/prompts/algo-video";
import {
  knowledgeVideoSchema,
  CLASSIFICATION_PROMPT,
  KNOWLEDGE_VIDEO_SYSTEM_PROMPT,
  contentClassificationSchema,
} from "@/lib/prompts/landscape-video";
import type { CardVideoData } from "@/lib/types/card-video";
import type { AlgoVideoData } from "@/lib/types/algo-video";
import type { KnowledgeVideoData, LandscapeVideoData } from "@/lib/types/landscape-video";

// ─── DeepSeek Client (OpenAI-compatible) ───

const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || "",
});

// ─── 提取 JSON 的辅助函数 ───

function extractJSON(text: string): string {
  // 尝试从 markdown 代码块中提取
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  // 尝试直接匹配花括号包围的部分
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  return text.trim();
}

// ─── 生成图文卡片视频数据 ───

export async function generateCardVideoData(
  userMessage: string,
  retries = 2
): Promise<{ videoData: CardVideoData; rawText: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { text } = await generateText({
        model: deepseek.chat("deepseek-chat"),
        system: CARD_VIDEO_SYSTEM_PROMPT,
        prompt: userMessage,
        temperature: 0.7,
        maxOutputTokens: 4096,
      });

      const jsonStr = extractJSON(text);
      const parsed = JSON.parse(jsonStr);
      const validated = cardVideoSchema.parse(parsed);

      return {
        videoData: validated as CardVideoData,
        rawText: text,
      };
    } catch (error) {
      if (attempt === retries) {
        throw new Error(
          `DeepSeek 生成失败 (已重试 ${retries} 次): ${error instanceof Error ? error.message : String(error)}`
        );
      }
      console.warn(`第 ${attempt + 1} 次生成失败，正在重试...`, error);
    }
  }

  throw new Error("unreachable");
}

// ─── 生成算法可视化视频数据 ───

export async function generateAlgoVideoData(
  userMessage: string,
  retries = 2
): Promise<{ videoData: AlgoVideoData; rawText: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { text } = await generateText({
        model: deepseek.chat("deepseek-chat"),
        system: ALGO_VIDEO_SYSTEM_PROMPT,
        prompt: userMessage,
        temperature: 0.5,
        maxOutputTokens: 8192,
      });

      const jsonStr = extractJSON(text);
      const parsed = JSON.parse(jsonStr);
      const validated = algoVideoSchema.parse(parsed);

      return {
        videoData: validated as AlgoVideoData,
        rawText: text,
      };
    } catch (error) {
      if (attempt === retries) {
        throw new Error(
          `DeepSeek 生成失败 (已重试 ${retries} 次): ${error instanceof Error ? error.message : String(error)}`
        );
      }
      console.warn(`第 ${attempt + 1} 次生成失败，正在重试...`, error);
    }
  }

  throw new Error("unreachable");
}

// ─── 生成知识讲解视频数据 ───

export async function generateKnowledgeVideoData(
  userMessage: string,
  retries = 2
): Promise<{ videoData: KnowledgeVideoData; rawText: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { text } = await generateText({
        model: deepseek.chat("deepseek-chat"),
        system: KNOWLEDGE_VIDEO_SYSTEM_PROMPT,
        prompt: userMessage,
        temperature: 0.7,
        maxOutputTokens: 8192,
      });

      const jsonStr = extractJSON(text);
      const parsed = JSON.parse(jsonStr);
      const validated = knowledgeVideoSchema.parse(parsed);

      return {
        videoData: validated as KnowledgeVideoData,
        rawText: text,
      };
    } catch (error) {
      if (attempt === retries) {
        throw new Error(
          `DeepSeek 生成失败 (已重试 ${retries} 次): ${error instanceof Error ? error.message : String(error)}`
        );
      }
      console.warn(`第 ${attempt + 1} 次生成失败，正在重试...`, error);
    }
  }

  throw new Error("unreachable");
}

// ─── 横屏视频智能分流（先分类再生成）───

export async function generateLandscapeVideoData(
  userMessage: string
): Promise<{
  videoData: LandscapeVideoData;
  rawText: string;
  contentType: "algorithm" | "knowledge";
}> {
  // 第一步：分类
  console.log("[分流] 判断内容类型...");
  let contentType: "algorithm" | "knowledge" = "knowledge"; // 默认知识讲解

  try {
    const { text } = await generateText({
      model: deepseek.chat("deepseek-chat"),
      system: CLASSIFICATION_PROMPT,
      prompt: userMessage,
      temperature: 0.1,
      maxOutputTokens: 200,
    });

    const jsonStr = extractJSON(text);
    const parsed = JSON.parse(jsonStr);
    const classification = contentClassificationSchema.parse(parsed);
    contentType = classification.contentType;
    console.log(`[分流] 类型: ${contentType} (${classification.reason})`);
  } catch (error) {
    console.warn("[分流] 分类失败，默认使用知识讲解模式:", error);
  }

  // 第二步：生成对应类型的视频数据
  if (contentType === "algorithm") {
    const result = await generateAlgoVideoData(userMessage);
    return { ...result, contentType };
  } else {
    const result = await generateKnowledgeVideoData(userMessage);
    return { ...result, contentType };
  }
}

// ─── 流式对话 ───

export async function streamChat(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const { textStream } = await import("ai").then((mod) =>
    mod.streamText({
      model: deepseek.chat("deepseek-chat"),
      messages,
      temperature: 0.8,
    })
  );
  return textStream;
}
