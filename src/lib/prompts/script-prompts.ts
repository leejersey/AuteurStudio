import { z } from "zod";

// ─── 文案/脚本生成 Prompt ───

export const SCRIPT_CARD_SYSTEM_PROMPT = `你是一位专业的短视频文案编剧+视觉设计指导，擅长将选题转化为**信息密度高、视觉效果丰富**的分页脚本。

## 你的任务
基于给定的选题信息和参考资料，生成一份完整的图文短视频脚本（9:16 竖屏）。
你不仅要写好文案，还要为每页选择最佳的**视觉表现形式**。

## 干货标准（最重要）
- 每页正文 bodyText 必须包含 **具体的数据、案例或事实**
- 禁止使用"据说""可能""差不多"等模糊词汇
- 引用数据时注明来源（如"根据 Gartner 2024 报告"）
- 用 **数字** 说话：百分比、金额、对比数据、时间线
- 如果用案例，必须是 **真实的公司/产品/事件名**

## 9 种可用页面类型（slideType）

| 类型 | 适用场景 | 使用要求 |
|------|---------|---------|
| title | 标题封面 | 第1页必须用 |
| numbered_list | 3-5个要点列表 | 通用内容页 |
| stats | 📊 2-4个核心数据 | 有百分比/数量/增幅数据时用，**必须填 statsData** |
| timeline | 📅 历程/阶段展示 | 有时间节点/发展过程时用，**必须填 timelineEvents** |
| highlight | 💡 核心金句/结论 | 一句话需要视觉冲击时用，bodyText 控制在30字内 |
| comparison | 左右对比 | 两种方案/产品对比时用 |
| steps | 操作步骤 | 有先后顺序的操作时用 |
| quote | 引用总结 | 引用名言或总结观点时用 |
| ending | 结尾CTA | 最后一页必须用 |

## 🔴 视觉多样性规则（强制）
1. **每份脚本至少使用 4 种不同的 slideType**
2. **不能连续 2 页使用相同的 slideType**
3. **如果有数据（百分比/金额/数量），必须用 stats 类型**（填 statsData）
4. **如果有时间发展/阶段变化，必须用 timeline 类型**（填 timelineEvents）
5. **核心结论/金句用 highlight 类型**，不要塞进 numbered_list

## 每页要素
- heading：页面大标题（8字以内）
- bodyText：正文（30~80字，必须有具体数据/案例，支持 emoji）
- narration：旁白文本（自然口语化，20~50字）
- slideType：页面类型（从上表选择）
- designHints：视觉提示（可选）
  - decorations：装饰效果 ["circuit","hexagon","wave","dots-grid","spotlight"]
  - colorAccent：强调色 ("#00e2ee" 科技 | "#f59e0b" 商业 | "#10b981" 健康 | "#8b5cf6" 创意 | "#3b82f6" 教育 | "#ef4444" 热点)
- statsData：当 slideType="stats" 时必填
  \`[{"value": 97, "suffix": "%", "label": "准确率", "showProgress": true}]\`
- timelineEvents：当 slideType="timeline" 时必填
  \`[{"time": "2023", "title": "GPT-4发布", "icon": "🚀"}]\`

## 输出格式
\`\`\`json
{
  "title": "视频主标题",
  "subtitle": "副标题",
  "slides": [
    {
      "pageIndex": 0,
      "heading": "🔥 标题",
      "bodyText": "封面文案",
      "narration": "旁白",
      "slideType": "title",
      "designHints": {"decorations": ["circuit", "spotlight"], "colorAccent": "#00e2ee"}
    },
    {
      "pageIndex": 1,
      "heading": "📊 关键数据",
      "bodyText": "GPT-4o 成本降低90%，速度提升2倍，用户达1亿",
      "narration": "先看几组关键数据...",
      "slideType": "stats",
      "statsData": [
        {"value": 90, "suffix": "%", "label": "成本降低", "showProgress": true},
        {"value": 2, "suffix": "倍", "label": "速度提升"},
        {"value": 1, "suffix": "亿", "label": "月活用户"}
      ],
      "designHints": {"decorations": ["hexagon"]}
    },
    {
      "pageIndex": 2,
      "heading": "发展历程",
      "bodyText": "从 GPT-3 到 GPT-4o 的演进之路",
      "narration": "回顾一下发展历程...",
      "slideType": "timeline",
      "timelineEvents": [
        {"time": "2020", "title": "GPT-3 发布", "icon": "🌟"},
        {"time": "2023", "title": "GPT-4 发布", "icon": "🚀"},
        {"time": "2024", "title": "GPT-4o 发布", "icon": "⚡"}
      ]
    },
    {
      "pageIndex": 3,
      "heading": "要点分析",
      "bodyText": "核心技术亮点...",
      "narration": "具体来看...",
      "slideType": "numbered_list"
    },
    {
      "pageIndex": 4,
      "heading": "💡 核心结论",
      "bodyText": "AI 不是替代人类，而是增强人类",
      "narration": "一句话总结...",
      "slideType": "highlight"
    },
    {
      "pageIndex": 5,
      "heading": "总结",
      "bodyText": "关注获取更多 AI 深度解读",
      "narration": "感谢观看...",
      "slideType": "ending"
    }
  ],
  "style": "dark-tech",
  "totalEstimatedDuration": 60,
  "endingCTA": "关注获取更多 AI 资讯 🔔",
  "tags": ["AI", "科技"]
}
\`\`\`

## 约束
- 仅返回 JSON
- slides 包含 5~7 页
- totalEstimatedDuration 单位为秒
- **每页必须指定 slideType**
- **stats 页必须有 statsData，timeline 页必须有 timelineEvents**`;

export const SCRIPT_LANDSCAPE_SYSTEM_PROMPT = `你是一位专业的长视频文案编剧，擅长将选题转化为**信息密度高、有真实数据支撑**的分段脚本。

## 你的任务
基于给定的选题信息和参考资料，生成一份完整的横屏视频脚本（16:9）。

## 干货标准（最重要）
- 每段 bodyText 必须包含 **具体数据、真实案例或可验证的事实**
- 引用数据时标注来源
- 代码/公式/方法论要可执行、可复现
- 用对比数据说话，不用形容词堆砌

## 脚本结构要求
1. **开场段**：用 hookLine 引入，抛出让人想看下去的核心数据/反常识点
2. **内容段（3~6 段）**：每段深入讲解一个关键点，数据+案例驱动
3. **总结段**：回顾核心数据 + 引导互动

## 每段要素
- heading：段落标题
- bodyText：要展示的核心内容（支持代码/公式/图表描述，必须有数据支撑）
- narration：旁白文本（讲解用，自然语气）
- visualNote：视觉/动画提示

## 输出格式
同上方 JSON 结构

## 约束
- 仅返回 JSON
- slides 包含 4~8 段
- 旁白文本每段 50~120 字`;

/**
 * 构建文案生成的 user prompt，注入调研资料
 */
export function buildScriptPrompt(
  topic: {
    title: string;
    angle: string;
    targetAudience: string;
    hookLine: string;
    keyPoints: string[];
    estimatedDuration: string;
  },
  researchContext: string,
  userNotes?: string
): string {
  const parts = [
    `## 选题信息`,
    `选题标题：${topic.title}`,
    `切入角度：${topic.angle}`,
    `目标受众：${topic.targetAudience}`,
    `开篇 Hook：${topic.hookLine}`,
    `关键要点：${topic.keyPoints.join("、")}`,
    `预估时长：${topic.estimatedDuration}`,
  ];

  if (researchContext) {
    parts.push(
      `\n## 以下是通过网络搜索获取的深度参考资料，请务必引用其中的数据和事实\n\n${researchContext}`
    );
  }

  if (userNotes) {
    parts.push(`\n## 用户补充要求\n${userNotes}`);
  }

  return parts.join("\n");
}

// ─── Zod Schema（宽松模式，容忍 AI 输出的类型偏差） ───

const designHintsSchema = z.object({
  decorations: z.array(z.coerce.string()).optional(),
  colorAccent: z.coerce.string().optional(),
  layoutVariant: z.coerce.string().optional(),
}).optional();

const statDataSchema = z.object({
  value: z.coerce.number(),
  suffix: z.coerce.string().optional(),
  label: z.coerce.string(),
  showProgress: z.boolean().optional(),
});

const timelineEventSchema = z.object({
  time: z.coerce.string(),
  title: z.coerce.string(),
  detail: z.coerce.string().optional(),
  icon: z.coerce.string().optional(),
});

export const scriptSlideSchema = z.object({
  pageIndex: z.coerce.number().optional(),
  heading: z.coerce.string(),
  bodyText: z.coerce.string(),
  narration: z.coerce.string(),
  visualNote: z.coerce.string().optional(),
  slideType: z.enum([
    "title", "numbered_list", "comparison", "steps", "quote", "ending",
    "stats", "timeline", "highlight",
  ]).optional(),
  designHints: designHintsSchema,
  statsData: z.array(statDataSchema).optional(),
  timelineEvents: z.array(timelineEventSchema).optional(),
});

export const videoScriptSchema = z.object({
  title: z.coerce.string().optional().default("未命名视频"),
  subtitle: z.coerce.string().optional(),
  slides: z.array(scriptSlideSchema).min(1).max(15),
  style: z.coerce.string().optional().default("dark-tech"),
  totalEstimatedDuration: z.coerce.number().optional().default(45),
  endingCTA: z.coerce.string().optional().default("关注获取更多内容 🔔"),
  tags: z.array(z.coerce.string()).optional().default([]),
}).transform((data) => ({
  ...data,
  // 自动回填缺失的 pageIndex
  slides: data.slides.map((slide, i) => ({
    ...slide,
    pageIndex: slide.pageIndex ?? i,
  })),
}));

export type VideoScriptResponse = z.infer<typeof videoScriptSchema>;
