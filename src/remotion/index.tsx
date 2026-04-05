import React from "react";
import { Composition, registerRoot } from "remotion";
import { CardVideo } from "./compositions/CardVideo";
import { AlgoVideo, calcAlgoTotalFrames } from "./compositions/AlgoVideo";
import { KnowledgeVideo, calcKnowledgeTotalFrames } from "./compositions/KnowledgeVideo";
import { MarkdownVideo, calcMarkdownTotalFrames } from "./compositions/MarkdownVideo";
import { SIZES, TIMING } from "./styles/theme";

// ─── 模板注册（side-effect import 触发注册） ───
import "./template-packs/dark-tech";
import "./template-packs/minimal-white";

// ─── 默认 props (用于 Remotion Studio 预览) ───

const defaultCardData = {
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

const defaultAlgoData = {
  meta: {
    title: "为什么腐烂橘子需要4分钟？",
    algorithm: "BFS",
    aspectRatio: "16:9" as const,
    difficulty: "中等",
  },
  narration: [
    { text: "今天我们来看一道经典的 BFS 题目——腐烂的橘子。" },
    { text: "首先，我们找到所有初始腐烂的橘子，把它们加入队列。" },
    { text: "然后，每一轮 BFS 扩展，相邻的新鲜橘子会变成腐烂的。" },
  ],
  steps: [
    {
      stepIndex: 0,
      description: "初始化网格：标记所有腐烂橘子为起点",
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
      description: "第 1 分钟：从 (0,0) 开始 BFS 扩展",
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
      description: "第 2 分钟：继续扩散至相邻新鲜橘子",
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

const defaultKnowledgeData = {
  meta: {
    title: "RAG 检索增强生成入门",
    category: "AI技术",
    style: "dark-tech" as const,
    aspectRatio: "16:9" as const,
    contentType: "knowledge" as const,
  },
  narration: [
    { text: "今天我们来了解 RAG，检索增强生成技术。" },
    { text: "RAG 的核心思路是：先检索，再生成。" },
    { text: "总结一下 RAG 的三个关键步骤。" },
  ],
  slides: [
    {
      type: "landscape_title" as const,
      heading: "RAG 检索增强生成入门",
      subtitle: "让大模型拥有实时知识",
      tags: ["AI", "RAG", "LLM"],
      narrationIndex: 0,
    },
    {
      type: "landscape_content" as const,
      heading: "核心流程",
      points: [
        { icon: "🔍", text: "检索相关文档", detail: "从向量数据库中召回" },
        { icon: "🧠", text: "上下文增强", detail: "将检索结果注入 Prompt" },
        { icon: "✍️", text: "生成回答", detail: "LLM 基于增强上下文生成" },
      ],
      narrationIndex: 1,
    },
    {
      type: "landscape_ending" as const,
      heading: "关键要点",
      summary: "RAG = 检索 + 生成，让 LLM 突破知识边界",
      keyTakeaways: ["向量检索", "上下文注入", "可信生成"],
      callToAction: "关注了解更多 AI 技术",
      narrationIndex: 2,
    },
  ],
};

const defaultMarkdownData = {
  meta: {
    title: "Markdown 教程演示",
    category: "技术教程",
    aspectRatio: "16:9" as const,
    codeTheme: "dracula" as const,
  },
  narration: [
    { text: "让我们来看一段 TypeScript 代码示例。" },
    { text: "这是一个简单的 Hello World 函数。" },
    { text: "感谢观看本期教程。" },
  ],
  slides: [
    {
      type: "md_title" as const,
      heading: "TypeScript 快速入门",
      subtitle: "用类型安全提升代码质量",
      tags: ["TypeScript", "教程"],
      narrationIndex: 0,
    },
    {
      type: "md_code" as const,
      heading: "Hello World",
      language: "typescript",
      code: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));',
      lines: [
        "function greet(name: string): string {",
        '  return `Hello, ${name}!`;',
        "}",
        "",
        'console.log(greet("World"));',
      ],
      highlightLines: [1, 2],
      narrationIndex: 1,
    },
    {
      type: "md_ending" as const,
      heading: "总结",
      summary: "TypeScript 为 JavaScript 添加了类型安全",
      callToAction: "关注获取更多技术教程",
      narrationIndex: 2,
    },
  ],
};

// ─── Remotion 入口 ───

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CardVideo"
        component={CardVideo as React.FC<any>}
        durationInFrames={
          defaultCardData.slides.length * TIMING.slideDurationSec * TIMING.fps
        }
        fps={TIMING.fps}
        width={SIZES.card.width}
        height={SIZES.card.height}
        defaultProps={{ data: defaultCardData }}
        calculateMetadata={({ props }) => {
          const d = props.data as typeof defaultCardData & { narration?: { text: string; durationMs?: number }[] };
          if (!d?.slides?.length) return { durationInFrames: 120 };
          const fps = TIMING.fps;
          const MIN = 4 * fps;
          let total = 0;
          for (let i = 0; i < d.slides.length; i++) {
            if (d.narration?.[i]?.durationMs) {
              total += Math.max(MIN, Math.ceil((d.narration[i].durationMs! / 1000) * fps));
            } else if (d.narration?.[i]?.text) {
              const ms = Math.max(3000, Math.ceil((d.narration[i].text.length / 4) * 1000) + 500);
              total += Math.max(MIN, Math.ceil((ms / 1000) * fps));
            } else {
              total += TIMING.slideDurationSec * fps;
            }
          }
          return { durationInFrames: total };
        }}
      />
      <Composition
        id="AlgoVideo"
        component={AlgoVideo as React.FC<any>}
        durationInFrames={defaultAlgoData.steps.length * 3 * TIMING.fps}
        fps={TIMING.fps}
        width={SIZES.algo.width}
        height={SIZES.algo.height}
        defaultProps={{ data: defaultAlgoData }}
        calculateMetadata={({ props }) => {
          const d = props.data as typeof defaultAlgoData;
          return { durationInFrames: calcAlgoTotalFrames(d) };
        }}
      />
      <Composition
        id="KnowledgeVideo"
        component={KnowledgeVideo as React.FC<any>}
        durationInFrames={defaultKnowledgeData.slides.length * 4 * TIMING.fps}
        fps={TIMING.fps}
        width={SIZES.algo.width}
        height={SIZES.algo.height}
        defaultProps={{ data: defaultKnowledgeData }}
        calculateMetadata={({ props }) => {
          const d = props.data as typeof defaultKnowledgeData;
          return { durationInFrames: calcKnowledgeTotalFrames(d) };
        }}
      />
      <Composition
        id="MarkdownVideo"
        component={MarkdownVideo as React.FC<any>}
        durationInFrames={defaultMarkdownData.slides.length * 5 * TIMING.fps}
        fps={TIMING.fps}
        width={SIZES.algo.width}
        height={SIZES.algo.height}
        defaultProps={{ data: defaultMarkdownData }}
        calculateMetadata={({ props }) => {
          const d = props.data as typeof defaultMarkdownData;
          return { durationInFrames: calcMarkdownTotalFrames(d as any) };
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
