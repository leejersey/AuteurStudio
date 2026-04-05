import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { parseMarkdown, slidesToTextForNarration } from "@/lib/markdown-parser";
import type { CodeTheme } from "@/lib/types/markdown-video";

const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || "",
});

/** POST /api/workflow/markdown — 解析 MD + AI 生成旁白 */
export async function POST(req: NextRequest) {
  try {
    const { markdown, theme = "dracula" } = (await req.json()) as {
      markdown: string;
      theme?: CodeTheme;
    };

    if (!markdown || markdown.trim().length < 10) {
      return NextResponse.json(
        { error: "请提供 Markdown 内容（至少 10 个字符）" },
        { status: 400 }
      );
    }

    // ─── Step 1: 解析 Markdown → 分页 Slides ───
    const slides = parseMarkdown(markdown);
    console.log(`[markdown] 解析完成: ${slides.length} 页`);

    // 提取每页文本，用于 AI 旁白
    const slideTexts = slidesToTextForNarration(slides);

    // ─── Step 2: AI 生成高质量旁白 ───
    const hasDSKey =
      process.env.DEEPSEEK_API_KEY &&
      process.env.DEEPSEEK_API_KEY !== "your_deepseek_api_key_here";

    let narrations: string[];

    if (hasDSKey) {
      const slideDescriptions = slideTexts
        .map((text, i) => `[${i + 1}] (${slides[i].type}): ${text}`)
        .join("\n");

      console.log(`[markdown] 共 ${slides.length} 页，请求 AI 生成旁白...`);
      console.log(`[markdown] 页面类型: ${slides.map((s) => s.type).join(", ")}`);

      const { text } = await generateText({
        model: deepseek.chat("deepseek-chat"),
        system: `你是一个技术视频旁白作者。为每一页幻灯片写一段自然、口语化的旁白。

严格格式要求：
- 每段旁白占一行，格式为 [编号] 旁白内容
- 例如：[1] 大家好，今天跟大家分享一个实用的技术话题。
- 严格按编号顺序输出，从 [1] 到 [${slides.length}]
- 语气专业但亲切，像在跟朋友讲解技术
- 代码页要解释代码在做什么，而不是逐行朗读
- 标题页要有吸引力的开场白
- 结尾页要有总结和鼓励
- 每段旁白 30-80 字`,
        prompt: `以下是一个技术分享文档的各页内容，请为每页写旁白：\n\n${slideDescriptions}\n\n请严格按格式输出 ${slides.length} 段旁白。`,
        temperature: 0.7,
        maxOutputTokens: 4000,
      });

      // 解析 [N] 格式的旁白
      const narrationMap = new Map<number, string>();
      const lines = text.split("\n").filter((l) => l.trim());

      for (const line of lines) {
        const match = line.match(/^\[(\d+)\]\s*(.+)/);
        if (match) {
          const idx = parseInt(match[1], 10) - 1;
          narrationMap.set(idx, match[2].trim());
        }
      }

      narrations = slides.map((_, i) =>
        narrationMap.get(i) || slideTexts[i] || ""
      );

      console.log(`[markdown] AI 返回 ${narrationMap.size}/${slides.length} 段旁白`);
    } else {
      // Mock 模式：使用提取的文本作为旁白
      narrations = slideTexts;
    }

    // ─── Step 3: 构造 VideoScript 格式（复用文案审核流程） ───
    const script = {
      title: slides[0].type === "md_title" ? slides[0].heading : "技术分享",
      subtitle:
        slides[0].type === "md_title" ? slides[0].subtitle : undefined,
      slides: slides.map((slide, i) => ({
        pageIndex: i,
        heading:
          slide.type === "md_code"
            ? `💻 ${slide.heading}`
            : slide.heading,
        bodyText:
          slide.type === "md_content"
            ? slide.points.map((p) => p.text).join("\n")
            : slide.type === "md_code"
            ? `\`\`\`${slide.language}\n${slide.code}\n\`\`\``
            : slide.type === "md_ending"
            ? slide.summary || ""
            : "",
        narration: narrations[i] || slideTexts[i] || "",
        visualNote: slide.type,
      })),
      style: theme,
      totalEstimatedDuration: slides.length * 8,
      endingCTA:
        slides[slides.length - 1].type === "md_ending"
          ? (slides[slides.length - 1] as { callToAction?: string })
              .callToAction || "关注获取更多技术内容 🔔"
          : "关注获取更多技术内容 🔔",
      tags: ["技术", "教程"],
    };

    return NextResponse.json({
      script,
      markdownSlides: slides,
      theme,
    });
  } catch (error) {
    console.error("[/api/workflow/markdown] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Markdown 解析失败",
      },
      { status: 500 }
    );
  }
}
