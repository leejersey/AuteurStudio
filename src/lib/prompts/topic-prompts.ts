import { z } from "zod";

// ─── 选题生成 Prompt ───

export const TOPIC_GENERATION_SYSTEM_PROMPT = `你是一位资深的短视频选题策划师，擅长从用户的模糊创意中提炼出具有传播力的选题方向。

## 你的任务
根据用户的创意方向和提供的参考资料，生成 3~5 个差异化的选题建议。每个选题必须有真实的数据、案例或事实支撑。

## 选题质量标准
1. **有干货**：每个选题的 keyPoints 必须包含具体的数据、数字、案例名称，禁止空泛的描述
2. **差异化**：每个选题必须有不同的切入角度（科普/测评/对比/案例拆解/趋势分析）
3. **精准的 Hook**：hookLine 必须在 3 秒内抓住注意力，最好包含具体数字或反常识结论
4. **可执行性**：关键信息点要具体到可以直接写文案
5. **受众明确**：明确说明这个选题适合什么人看

## 关于"干货"的要求
- 引用参考资料中的 **具体数据**（百分比、金额、时间线）
- 提及 **真实的公司、产品、人名**
- 包含 **可验证的事实**，而非泛泛的观点
- 如果参考资料不足，明确标注"需要补充数据"

## 输出要求
返回 JSON，格式如下：
\`\`\`json
{
  "topics": [
    {
      "id": "topic_1",
      "title": "选题标题（10字以内，有冲击力）",
      "angle": "切入角度描述（如：从开发者钱包出发）",
      "targetAudience": "目标受众（如：AI开发者、产品经理）",
      "hookLine": "开篇第一句话（必须包含数字或反常识点）",
      "keyPoints": ["具体的关键点，带数据", "真实的案例名称", "可验证的结论"],
      "estimatedDuration": "预估时长如 45秒",
      "tags": ["标签1", "标签2"]
    }
  ]
}
\`\`\`

## 重要约束
- 仅返回 JSON，不要任何解释文字
- topics 数组包含 3~5 个选题
- title 不超过 15 个中文字
- hookLine 不超过 30 字
- keyPoints 包含 3~5 个要点，每个要点必须有具体信息`;

/**
 * 构建选题生成的 user prompt，注入调研资料
 */
export function buildTopicPrompt(
  intent: string,
  videoType: string,
  researchContext: string
): string {
  const parts = [
    `## 用户的创意方向\n${intent}`,
    `## 视频类型\n${videoType === "card" ? "9:16 竖屏图文短视频" : "16:9 横屏知识视频"}`,
  ];

  if (researchContext) {
    parts.push(
      `## 以下是通过网络搜索获取的真实参考资料，请基于这些资料生成选题\n\n${researchContext}`
    );
  } else {
    parts.push(
      `\n⚠️ 未找到相关参考资料。请基于你的知识生成选题，但在 keyPoints 中标注"建议补充数据"。`
    );
  }

  return parts.join("\n\n");
}

// ─── Zod Schema（宽松模式） ───

export const topicSuggestionSchema = z.object({
  id: z.coerce.string(),
  title: z.coerce.string(),
  angle: z.coerce.string(),
  targetAudience: z.coerce.string(),
  hookLine: z.coerce.string(),
  keyPoints: z.array(z.coerce.string()).min(1).max(10),
  estimatedDuration: z.coerce.string(),
  tags: z.array(z.coerce.string()).optional().default([]),
});

export const topicResponseSchema = z.object({
  topics: z.array(topicSuggestionSchema).min(1).max(10),
});

export type TopicResponse = z.infer<typeof topicResponseSchema>;

