import { z } from "zod";

// ─── Slide 级设计指令 Schema ───

const slideDesignHintsSchema = {
  layoutVariant: z.string().optional(),
  decorations: z.array(z.string()).optional(),
  colorAccent: z.string().optional(),
  iconStyle: z.enum(["emoji", "material"]).optional(),
};

// ─── Zod Schema for LLM output validation ───

const titleSlideSchema = z.object({
  type: z.literal("title"),
  category: z.string(),
  heading: z.string(),
  subtitle: z.string(),
  highlightWords: z.array(z.string()).optional(),
  imageKeyword: z.string().describe("2-4 English keywords for Unsplash image search"),
  ...slideDesignHintsSchema,
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
  ...slideDesignHintsSchema,
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
  ...slideDesignHintsSchema,
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
  ...slideDesignHintsSchema,
});

const quoteSlideSchema = z.object({
  type: z.literal("quote"),
  heading: z.string().optional(),
  quote: z.string(),
  source: z.string().optional(),
  summary: z.string().optional(),
  discussionPrompts: z.array(z.string()).optional(),
  imageKeyword: z.string().describe("2-4 English keywords for Unsplash image search"),
  ...slideDesignHintsSchema,
});

const endingSlideSchema = z.object({
  type: z.literal("ending"),
  authorName: z.string(),
  authorAvatar: z.string().optional(),
  callToAction: z.string(),
  tags: z.array(z.string()).optional(),
  imageKeyword: z.string().optional(),
  ...slideDesignHintsSchema,
});

// ─── 新增 Slide 类型 Schema ───

const statsSlideSchema = z.object({
  type: z.literal("stats"),
  heading: z.string().optional(),
  stats: z.array(z.object({
    value: z.number(),
    suffix: z.string().optional(),
    label: z.string(),
    color: z.string().optional(),
    showProgress: z.boolean().optional(),
  })).min(2).max(4),
  imageKeyword: z.string().optional(),
  ...slideDesignHintsSchema,
});

const timelineSlideSchema = z.object({
  type: z.literal("timeline"),
  heading: z.string(),
  events: z.array(z.object({
    time: z.string(),
    title: z.string(),
    detail: z.string().optional(),
    icon: z.string().optional(),
  })).min(2).max(5),
  imageKeyword: z.string().optional(),
  ...slideDesignHintsSchema,
});

const highlightSlideSchema = z.object({
  type: z.literal("highlight"),
  text: z.string(),
  subtext: z.string().optional(),
  decoration: z.enum(["spotlight", "wave", "pattern"]).optional(),
  imageKeyword: z.string().optional(),
  ...slideDesignHintsSchema,
});

const slideSchema = z.discriminatedUnion("type", [
  titleSlideSchema,
  numberedListSlideSchema,
  comparisonSlideSchema,
  stepsSlideSchema,
  quoteSlideSchema,
  endingSlideSchema,
  statsSlideSchema,
  timelineSlideSchema,
  highlightSlideSchema,
]);

// ─── 全局设计指令 Schema ───

const designDirectivesSchema = z.object({
  colorPalette: z.object({
    accent: z.string(),
    accentSecondary: z.string().optional(),
  }).optional(),
  mood: z.enum(["energetic", "calm", "professional", "playful", "dramatic"]).optional(),
  decorationDensity: z.enum(["minimal", "moderate", "rich"]).optional(),
  backgroundPattern: z.enum(["circuit", "wave", "hexagon", "dots-grid", "none"]).optional(),
}).optional();

export const cardVideoSchema = z.object({
  meta: z.object({
    title: z.string(),
    category: z.string(),
    style: z.enum(["dark-tech", "minimal-light", "gradient-purple"]),
    aspectRatio: z.literal("9:16"),
    bgmTrack: z.string().optional(),
    designDirectives: designDirectivesSchema,
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
    "bgmTrack": "(可选) 背景音乐路径",
    "designDirectives": {
      "colorPalette": { "accent": "#00e2ee", "accentSecondary": "#ac8aff" },
      "mood": "energetic | calm | professional | playful | dramatic",
      "decorationDensity": "minimal | moderate | rich",
      "backgroundPattern": "circuit | wave | hexagon | dots-grid | none"
    }
  },
  "slides": [
    // 第一页必须是 title 类型
    {
      "type": "title",
      "category": "分类标签",
      "heading": "主标题，要有冲击力",
      "subtitle": "副标题",
      "highlightWords": ["要渐变高亮的关键词"],
      "imageKeyword": "technology abstract futuristic",
      "layoutVariant": "bottom-left | center | split",
      "decorations": ["circuit", "spotlight"]
    },
    // 中间页面根据内容自动选择类型
    {
      "type": "numbered_list",
      "heading": "小标题",
      "items": [{"text": "要点", "detail": "补充说明"}],
      "tags": ["标签1"],
      "imageKeyword": "data analysis chart",
      "layoutVariant": "cards | timeline | compact"
    },
    {
      "type": "comparison",
      "heading": "对比标题",
      "left": {"title": "左标题", "items": [{"text": "条目", "positive": true}]},
      "right": {"title": "右标题", "items": [{"text": "条目", "positive": false}]},
      "layoutVariant": "side-by-side | stacked | overlay"
    },
    {
      "type": "steps",
      "heading": "步骤标题",
      "steps": [{"action": "操作描述", "note": "右侧备注"}],
      "layoutVariant": "vertical | horizontal | zigzag"
    },
    {
      "type": "stats",
      "heading": "数据标题",
      "stats": [
        {"value": 97, "suffix": "%", "label": "准确率", "showProgress": true},
        {"value": 5000, "suffix": "+", "label": "用户数"}
      ],
      "layoutVariant": "grid | row | featured"
    },
    {
      "type": "timeline",
      "heading": "发展历程",
      "events": [
        {"time": "2023", "title": "里程碑事件", "detail": "详细描述", "icon": "🚀"}
      ]
    },
    {
      "type": "highlight",
      "text": "核心金句或关键结论",
      "subtext": "补充说明",
      "decoration": "spotlight | wave | pattern"
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

export const CARD_VIDEO_SYSTEM_PROMPT = `你是一个自媒体短视频内容生成助手，同时也是**视觉美术指导**。
用户会给你一个主题，你需要生成一组图文卡片视频的内容和视觉设计指令。

## 输出要求
- 必须严格输出 JSON，符合以下 schema
- 生成 4-7 页 slides（比之前更丰富）
- 第一页必须是 title 类型
- 最后一页必须是 ending 类型
- 中间页面根据内容自动选择最合适的类型
- 标题要有冲击力，善用 emoji
- 每页内容精炼，控制在 3-5 个要点以内
- 高亮关键词用 highlightWords 标注
- 如果用户要求切换风格，则修改 meta.style

## 可用的 slide 类型（9 种）
- title: 标题封面页
- numbered_list: 编号要点页
- comparison: 左右对比页
- steps: 步骤指引页
- quote: 引用总结页
- ending: 结尾互动页
- stats: 📊 数据统计页 — 当有 2-4 个关键数字时使用（市场数据、性能指标、百分比等）
- timeline: 📅 时间线页 — 展示历程、过程、演进、版本更新等
- highlight: 💡 核心亮点页 — 一句核心金句/结论需要强调视觉冲击时使用

## 视觉设计指导

### 全局设计指令（meta.designDirectives）
根据内容主题做出设计决策：
- colorPalette: 选择合适的强调色
  - 科技主题: 青色系 "#00e2ee"
  - 商业财经: 金色系 "#f59e0b"
  - 健康生活: 绿色系 "#10b981"
  - 创意设计: 紫色系 "#8b5cf6"
  - 教育学习: 蓝色系 "#3b82f6"
  - 热点新闻: 红橙系 "#ef4444"
- mood: 根据内容情绪选择 (energetic/calm/professional/playful/dramatic)
- decorationDensity: "rich" 适合科技/创意，"minimal" 适合严肃/专业
- backgroundPattern: 选择与内容匹配的背景纹理

### 每页设计指令（Slide 级别）
- layoutVariant: 为每种 slide 类型选择最适合内容的布局变体
- decorations: 选择 0-2 个装饰效果 (可选值: "circuit", "wave", "hexagon", "dots-grid", "spotlight")
- colorAccent: 如果某页需要独立突出，可指定独立强调色

### 布局变体参考
| Slide 类型 | 可选 layoutVariant |
|-----------|-------------------|
| title | bottom-left (默认), center, split |
| numbered_list | cards (默认), timeline, compact |
| comparison | side-by-side (默认), stacked, overlay |
| steps | vertical (默认), horizontal, zigzag |
| stats | grid (默认), row, featured |

### 设计原则
- **视觉节奏**: 信息密集页 → 留白/highlight → 密集页，让观众有呼吸感
- **变化感**: 相邻两页不用相同的 layoutVariant
- **新类型优先**: 如果内容中有关键数据，优先用 stats 页；有核心金句，优先用 highlight 页
- **强调一致性**: colorPalette 保持全局统一，仅 1-2 页可用独立 colorAccent

## JSON Schema
${schemaDescription}

## 重要
- 只输出 JSON，不要输出其他任何文字
- 确保 JSON 格式正确，可以被 JSON.parse() 解析
- authorName 默认使用 "创作者"
- 每个 slide 必须包含 imageKeyword 字段，值为 2-4 个英文关键词（用空格分隔），描述该页内容对应的视觉画面
- imageKeyword 不要用中文，必须是英文
- imageKeyword 要具体、有画面感，如 "neural network data flow" 而不是 "AI"
- designDirectives 必须填写，根据主题智能选择
- 尽量使用新增的 slide 类型（stats, timeline, highlight）让视频更丰富`;
