import { z } from "zod";

// ─── Zod Schema for LLM output validation ───

const titleSlideSchema = z.object({
  type: z.literal("title"),
  category: z.string(),
  heading: z.string(),
  subtitle: z.string(),
  highlightWords: z.array(z.string()).optional(),
  imageKeyword: z.string().describe("2-4 English keywords for Unsplash image search"),
});

const numberedListSlideSchema = z.object({
  type: z.literal("numbered_list"),
  heading: z.string().optional(),
  items: z.array(
    z.object({
      text: z.string(),
      detail: z.string().optional(),
    })
  ),
  tags: z.array(z.string()).optional(),
  imageKeyword: z.string().describe("2-4 English keywords for Unsplash image search"),
});

const comparisonSlideSchema = z.object({
  type: z.literal("comparison"),
  heading: z.string(),
  left: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    items: z.array(
      z.object({ text: z.string(), positive: z.boolean().optional() })
    ),
  }),
  right: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    items: z.array(
      z.object({ text: z.string(), positive: z.boolean().optional() })
    ),
  }),
  imageKeyword: z.string().describe("2-4 English keywords for Unsplash image search"),
});

const stepsSlideSchema = z.object({
  type: z.literal("steps"),
  heading: z.string(),
  subheading: z.string().optional(),
  steps: z.array(
    z.object({
      action: z.string(),
      note: z.string().optional(),
    })
  ),
  linkCard: z
    .object({
      title: z.string(),
      url: z.string(),
    })
    .optional(),
  imageKeyword: z.string().describe("2-4 English keywords for Unsplash image search"),
});

const quoteSlideSchema = z.object({
  type: z.literal("quote"),
  heading: z.string().optional(),
  quote: z.string(),
  source: z.string().optional(),
  summary: z.string().optional(),
  discussionPrompts: z.array(z.string()).optional(),
  imageKeyword: z.string().describe("2-4 English keywords for Unsplash image search"),
});

const endingSlideSchema = z.object({
  type: z.literal("ending"),
  authorName: z.string(),
  authorAvatar: z.string().optional(),
  callToAction: z.string(),
  tags: z.array(z.string()).optional(),
  imageKeyword: z.string().optional(),
});

const slideSchema = z.discriminatedUnion("type", [
  titleSlideSchema,
  numberedListSlideSchema,
  comparisonSlideSchema,
  stepsSlideSchema,
  quoteSlideSchema,
  endingSlideSchema,
]);

export const cardVideoSchema = z.object({
  meta: z.object({
    title: z.string(),
    category: z.string(),
    style: z.enum(["dark-tech", "minimal-light", "gradient-purple"]),
    aspectRatio: z.literal("9:16"),
    bgmTrack: z.string().optional(),
  }),
  slides: z.array(slideSchema).min(3).max(8),
});

export type CardVideoSchemaType = z.infer<typeof cardVideoSchema>;

// ─── System Prompt ───

const schemaDescription = `{
  "meta": {
    "title": "视频主标题",
    "category": "分类标签，如'AI资讯'、'技术解读'",
    "style": "dark-tech | minimal-light | gradient-purple",
    "aspectRatio": "9:16",
    "bgmTrack": "(可选) 背景音乐路径"
  },
  "slides": [
    // 第一页必须是 title 类型
    {
      "type": "title",
      "category": "分类标签",
      "heading": "主标题，要有冲击力",
      "subtitle": "副标题",
      "highlightWords": ["要渐变高亮的关键词"],
      "imageKeyword": "technology abstract futuristic"
    },
    // 中间页面根据内容自动选择类型
    {
      "type": "numbered_list",
      "heading": "小标题",
      "items": [{"text": "要点", "detail": "补充说明"}],
      "tags": ["标签1"],
      "imageKeyword": "data analysis chart"
    },
    {
      "type": "comparison",
      "heading": "对比标题",
      "left": {"title": "左标题", "items": [{"text": "条目", "positive": true}]},
      "right": {"title": "右标题", "items": [{"text": "条目", "positive": false}]}
    },
    {
      "type": "steps",
      "heading": "步骤标题",
      "steps": [{"action": "操作描述", "note": "右侧备注"}]
    },
    {
      "type": "quote",
      "quote": "引用原文",
      "source": "来源",
      "summary": "金句总结",
      "discussionPrompts": ["互动问题"]
    },
    // 最后一页必须是 ending 类型
    {
      "type": "ending",
      "authorName": "作者名",
      "callToAction": "关注获取更多AI资讯",
      "tags": ["标签"]
    }
  ]
}`;

export const CARD_VIDEO_SYSTEM_PROMPT = `你是一个自媒体短视频内容生成助手。
用户会给你一个主题，你需要生成一组图文卡片视频的内容。

## 输出要求
- 必须严格输出 JSON，符合以下 schema
- 生成 3-6 页 slides
- 第一页必须是 title 类型
- 最后一页必须是 ending 类型
- 中间页面根据内容自动选择最合适的类型
- 标题要有冲击力，善用 emoji
- 每页内容精炼，控制在 3-5 个要点以内
- 高亮关键词用 highlightWords 标注
- 如果用户要求切换风格，则修改 meta.style

## 可用的 slide 类型
- title: 标题封面页
- numbered_list: 编号要点页
- comparison: 左右对比页
- steps: 步骤指引页
- quote: 引用总结页
- ending: 结尾互动页

## JSON Schema
${schemaDescription}

## 重要
- 只输出 JSON，不要输出其他任何文字
- 确保 JSON 格式正确，可以被 JSON.parse() 解析
- authorName 默认使用 "创作者"
- 每个 slide 必须包含 imageKeyword 字段，值为 2-4 个英文关键词（用空格分隔），描述该页内容对应的视觉画面
- imageKeyword 不要用中文，必须是英文
- imageKeyword 要具体、有画面感，如 "neural network data flow" 而不是 "AI"`;
