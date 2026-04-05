import { z } from "zod";

// ─── 知识讲解 Slide Schema ───

const landscapeTitleSchema = z.object({
  type: z.literal("landscape_title"),
  heading: z.string(),
  subtitle: z.string(),
  tags: z.array(z.string()).optional(),
  narrationIndex: z.number(),
});

const landscapeContentSchema = z.object({
  type: z.literal("landscape_content"),
  heading: z.string(),
  points: z.array(z.object({
    icon: z.string().optional(),
    text: z.string(),
    detail: z.string().optional(),
  })).min(1),
  narrationIndex: z.number(),
});

const landscapeDiagramSchema = z.object({
  type: z.literal("landscape_diagram"),
  heading: z.string(),
  diagramType: z.enum(["flow", "layers", "compare"]),
  nodes: z.array(z.object({
    label: z.string(),
    icon: z.string().optional(),
    description: z.string().optional(),
  })).min(2),
  connections: z.array(z.string()).optional(),
  narrationIndex: z.number(),
});

const landscapeEndingSchema = z.object({
  type: z.literal("landscape_ending"),
  heading: z.string(),
  summary: z.string(),
  keyTakeaways: z.array(z.string()).optional(),
  callToAction: z.string().optional(),
  narrationIndex: z.number(),
});

const landscapeSlideSchema = z.discriminatedUnion("type", [
  landscapeTitleSchema,
  landscapeContentSchema,
  landscapeDiagramSchema,
  landscapeEndingSchema,
]);

const narrationSegmentSchema = z.object({
  text: z.string(),
  durationMs: z.number().optional(),
});

export const knowledgeVideoSchema = z.object({
  meta: z.object({
    title: z.string(),
    category: z.string(),
    style: z.enum(["dark-tech", "minimal-light", "gradient-purple"]),
    aspectRatio: z.literal("16:9"),
    contentType: z.literal("knowledge"),
  }),
  narration: z.array(narrationSegmentSchema).min(1),
  slides: z.array(landscapeSlideSchema).min(3),
});

export type KnowledgeVideoSchemaType = z.infer<typeof knowledgeVideoSchema>;

// ─── 内容分类 Schema ───

export const contentClassificationSchema = z.object({
  contentType: z.enum(["algorithm", "knowledge"]),
  reason: z.string(),
});

// ─── System Prompts ───

export const CLASSIFICATION_PROMPT = `你是一个内容分类助手。判断用户输入的主题属于哪种类型：

- **algorithm**: 数据结构与算法相关（排序、搜索、BFS、DFS、动态规划、链表、树、图等）
- **knowledge**: 技术知识讲解（概念介绍、架构设计、工具对比、最佳实践等）

严格输出 JSON：
{"contentType": "algorithm" 或 "knowledge", "reason": "简短理由"}`;

export const KNOWLEDGE_VIDEO_SYSTEM_PROMPT = `你是一个技术知识讲解视频内容生成助手。
用户会给你一个技术话题，你需要生成一个 16:9 横屏知识讲解视频的完整数据。

## 输出要求
- 必须严格输出 JSON
- 生成 4-7 页 slides
- 第一页必须是 landscape_title 类型
- 最后一页必须是 landscape_ending 类型
- 中间页面用 landscape_content（要点讲解）和 landscape_diagram（流程/架构图）
- 旁白(narration)分段，每页对应一段旁白
- 旁白文本使用通俗易懂的中文，像在给观众讲课，每段 30-60 字左右

## 可用的 slide 类型

### landscape_title（标题页）
- heading: 吸引人的视频标题
- subtitle: 一句话概括
- tags: 关键词标签数组

### landscape_content（要点讲解页）
- heading: 小标题
- points: 要点数组，每个包含 icon(emoji)、text(要点)、detail(补充，可选)
- 建议 3-5 个要点

### landscape_diagram（图解页）
- heading: 标题
- diagramType: "flow"(流程图) | "layers"(分层架构) | "compare"(对比)
- nodes: 节点数组，每个包含 label、icon(emoji)、description(可选)
- connections: 连接关系描述数组，如 "用户查询 → 向量检索"

### landscape_ending（总结页）
- heading: 总结标题
- summary: 一句话总结
- keyTakeaways: 关键要点回顾数组
- callToAction: 号召行为

## JSON Schema
{
  "meta": {
    "title": "视频标题",
    "category": "技术分类",
    "style": "dark-tech",
    "aspectRatio": "16:9",
    "contentType": "knowledge"
  },
  "narration": [
    { "text": "旁白文本，一段自然语言描述", "durationMs": 5000 }
  ],
  "slides": [
    {
      "type": "landscape_title",
      "heading": "什么是 RAG？",
      "subtitle": "检索增强生成的核心原理",
      "tags": ["AI", "RAG", "LLM"],
      "narrationIndex": 0
    },
    {
      "type": "landscape_content",
      "heading": "RAG 的三大核心组件",
      "points": [
        { "icon": "📄", "text": "知识库", "detail": "存储领域文档和数据" },
        { "icon": "🔍", "text": "检索器", "detail": "向量相似度匹配" },
        { "icon": "🤖", "text": "生成器", "detail": "LLM 基于检索结果回答" }
      ],
      "narrationIndex": 1
    },
    {
      "type": "landscape_diagram",
      "heading": "RAG 工作流程",
      "diagramType": "flow",
      "nodes": [
        { "label": "用户提问", "icon": "💬" },
        { "label": "向量检索", "icon": "🔍" },
        { "label": "上下文拼接", "icon": "📋" },
        { "label": "LLM 生成", "icon": "🤖" },
        { "label": "返回答案", "icon": "✅" }
      ],
      "connections": ["用户提问 → 向量检索", "向量检索 → 上下文拼接", "上下文拼接 → LLM 生成", "LLM 生成 → 返回答案"],
      "narrationIndex": 2
    }
  ]
}

## 重要
- 只输出 JSON，不要输出其他任何文字
- narrationIndex 指向 narration 数组的索引
- 每页 slide 都必须有 narrationIndex
- style 固定使用 "dark-tech"`;
