import { tavily } from "@tavily/core";

// ─── Tavily 搜索工具 ───
// 为 AI 文案生成提供真实资料支撑，避免"吹水"内容

const client = tavily({ apiKey: process.env.TAVILY_API_KEY || "" });

export interface ResearchResult {
  /** 搜索摘要（Tavily 自动生成的答案） */
  summary: string;
  /** 原始搜索结果条目 */
  sources: {
    title: string;
    url: string;
    content: string;
  }[];
  /** 格式化后的参考资料文本，可直接注入 Prompt */
  formattedContext: string;
}

/**
 * 搜索指定话题的相关资料
 * @param query 搜索关键词
 * @param options 搜索选项
 */
export async function researchTopic(
  query: string,
  options?: {
    maxResults?: number;
    searchDepth?: "basic" | "advanced";
    topic?: "general" | "news";
  }
): Promise<ResearchResult> {
  // 如果没有配置 API Key，返回空结果（降级到纯 AI 生成）
  if (!process.env.TAVILY_API_KEY) {
    console.warn("[Tavily] 未配置 TAVILY_API_KEY，跳过调研步骤");
    return {
      summary: "",
      sources: [],
      formattedContext: "",
    };
  }

  try {
    const response = await client.search(query, {
      maxResults: options?.maxResults ?? 5,
      searchDepth: options?.searchDepth ?? "advanced",
      topic: options?.topic ?? "general",
      includeAnswer: true,
    });

    const sources = (response.results || []).map((r) => ({
      title: r.title || "",
      url: r.url || "",
      content: (r.content || "").slice(0, 500), // 截断过长内容
    }));

    // 格式化为可注入 Prompt 的文本
    const formattedContext = formatResearchContext(
      response.answer || "",
      sources
    );

    return {
      summary: response.answer || "",
      sources,
      formattedContext,
    };
  } catch (error) {
    console.error("[Tavily] 搜索失败:", error);
    return {
      summary: "",
      sources: [],
      formattedContext: "",
    };
  }
}

/**
 * 将搜索结果格式化为 Prompt 可用的参考资料文本
 */
function formatResearchContext(
  answer: string,
  sources: { title: string; url: string; content: string }[]
): string {
  if (!answer && sources.length === 0) return "";

  const parts: string[] = [];

  if (answer) {
    parts.push(`## 调研摘要\n${answer}`);
  }

  if (sources.length > 0) {
    parts.push(
      `## 参考资料（共 ${sources.length} 条）\n` +
        sources
          .map(
            (s, i) =>
              `### 资料 ${i + 1}: ${s.title}\n来源: ${s.url}\n内容摘要: ${s.content}`
          )
          .join("\n\n")
    );
  }

  return parts.join("\n\n");
}
