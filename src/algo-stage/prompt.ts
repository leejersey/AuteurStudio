import { z } from "zod";

const idSchema = z.string().regex(/^[a-z][a-z0-9-]*$/, "ID 必须以小写字母开头，仅含小写字母、数字和连字符");
const nonEmpty = z.string().trim().min(1);

export const algoBlueprintSchema = z.object({
  meta: z.object({
    id: idSchema,
    title: nonEmpty,
    algorithm: nonEmpty,
    language: nonEmpty.default("javascript"),
    filename: nonEmpty,
    shikiTheme: z.enum(["dracula", "tokyo-night", "github-dark", "catppuccin-mocha", "one-dark-pro"]).default("dracula"),
    complexity: z.object({
      time: nonEmpty,
      space: nonEmpty,
    }).strict().optional(),
  }).strict(),
  code: z.string().min(1),
  runnerCode: z.string().min(1),
}).strict();

export type AlgoBlueprint = z.infer<typeof algoBlueprintSchema>;

export interface AlgoStagePromptRequest {
  topic: string;
  structureHint?: "array" | "linked-list" | "tree" | "matrix" | "stack-queue";
  sampleInput?: string;
  referenceCode?: string;
  shikiTheme?: "dracula" | "tokyo-night" | "github-dark" | "catppuccin-mocha" | "one-dark-pro";
}

export const ALGO_STAGE_SYSTEM_PROMPT = `你是一位顶级的算法可视化导演与工程师。你的任务不是手动编造算法步骤，而是编写：
1. \`code\`：用于视频左侧屏幕展示的干净、精炼的教学代码（6~22 行，每行 ≤ 64 字符）。
2. \`runnerCode\`：一段真正能在隔离 JavaScript 沙箱中运行的埋点代码，通过调用全局 \`tracer.step({...})\` 实时上报每一步状态，由系统真实运行并生成零幻觉的动画帧！

## 沙箱 \`tracer.step\` API 规范
每次调用 \`tracer.step(payload)\` 必须传入以下结构：
\`\`\`js
tracer.step({
  line: 6,                 // 必填：对应左侧 display code 的 1-based 行号（绝对不能超出 code 总行数）
  event: "compare",        // 枚举："init" | "compare" | "swap" | "move" | "update" | "found" | "done"
  note: "简短步骤说明（≤ 40 字）",
  narration: "自然口语化的中文旁白（15~42 字）",
  vars: { left: 0, right: 5, mid: 2 }, // 仅允许 string | number | boolean | null
  structure: { ... }       // 必填：以下 3 种标准数据结构之一
});
\`\`\`

## 5 种支持的数据结构 Schema（\`structure\`）
1. **数组 (\`type: "array"\`)** — 适合排序、二分、双指针、滑动窗口：
   \`{ type: "array", label: "说明", items: [{ value: 12, state: "default|active|comparing|swapped|sorted|pivot|found|dim" }], pointers: [{ name: "L", index: 0, color: "#38bdf8" }], swappedPair: [1, 3] }\`
   （items 长度 4~10 为佳；当本步发生元素交换时填写 \`swappedPair: [i, j]\` 可自动触发弧线互换动画）
2. **链表 (\`type: "linked-list"\`)** — 适合反转、快慢指针、合并链表：
   \`{ type: "linked-list", label: "说明", nodes: [{ id: "n1", value: 1, state: "..." }], edges: [{ from: "n1", to: "n2", state: "default|active|reversed" }], pointers: [{ name: "curr", nodeId: "n1", color: "#38bdf8" }] }\`
3. **二叉树 (\`type: "tree"\`)** — 适合 DFS/BFS 遍历、BST 查找：
   \`{ type: "tree", label: "说明", nodes: [{ id: "r", value: 10, parentId: null, state: "..." }, { id: "l", value: 5, parentId: "r", side: "left", state: "..." }], pointers: [{ name: "curr", nodeId: "l", color: "#fbbf24" }] }\`
4. **二维矩阵 / DP 表 (\`type: "matrix"\`)** — 适合动态规划填表、网格 BFS/DFS：
   \`{ type: "matrix", label: "dp[i][j]", rows: [[{ value: 0, state: "default" }, ...]], rowLabels: ["0","1"], colLabels: ["0","1"], activeCell: [1, 1], fromCells: [[0, 1], [1, 0]] }\`
5. **栈 / 队列 / 调用栈 (\`type: "stack-queue"\`)** — 适合单调栈、括号匹配、BFS 队列、递归调用栈：
   \`{ type: "stack-queue", variant: "stack|queue|call-stack", label: "Stack", items: [{ id: "s1", label: "(", detail: "idx=0", state: "active" }], action: "push|pop|peek|idle" }\`

## 关键工程约束
- **控制总步数**：选择小而经典的示例输入（如 5~8 个元素的数组、4~5 个节点的链表或 5~7 个节点的树），使 \`tracer.step\` 总调用次数控制在 **5 ~ 16 步**之间，节奏紧凑不拖沓。
- **沙箱纯净性**：\`runnerCode\` 仅可使用标准 ES 语法（\`Math / Array / Object / Map / Set / JSON\`），禁止使用 \`require / import / process / fetch / setTimeout\`。
- **零越界**：每次 \`tracer.step\` 的 \`line\` 必须严格在 \`1 .. code.split("\\n").length\` 范围内。
- **只输出合法 JSON**，严格符合以下格式：
\`\`\`json
{
  "meta": {
    "id": "algo-kebab-case-id",
    "title": "吸引人的中文标题",
    "algorithm": "算法英文标签如 SLIDING WINDOW / QUICK SORT / DFS",
    "language": "javascript",
    "filename": "solution.js",
    "shikiTheme": "dracula",
    "complexity": { "time": "O(n)", "space": "O(1)" }
  },
  "code": "左侧展示代码",
  "runnerCode": "沙箱执行的 JS 埋点代码"
}
\`\`\``;

export function buildAlgoUserPrompt(req: AlgoStagePromptRequest): string {
  const parts = [`请为以下算法/数据结构主题生成 AlgoStage 蓝图（含展示代码与可运行沙箱埋点代码 JSON）：`, `\n主题：${req.topic}`];
  if (req.structureHint) parts.push(`推荐数据结构视图：${req.structureHint}`);
  if (req.sampleInput) parts.push(`指定示例输入：${req.sampleInput}`);
  if (req.referenceCode) {
    parts.push(
      `\n用户提供的参考题解代码（请尽量保留其核心思路作为左侧展示代码，并编写等价的可运行沙箱埋点 runnerCode）：\n\`\`\`\n${req.referenceCode}\n\`\`\``,
    );
  }
  if (req.shikiTheme) parts.push(`代码配色主题：${req.shikiTheme}`);
  return parts.join("\n");
}

export function buildAlgoRepairPrompt(previousJson: string, issues: string[]): string {
  return [
    "你上一次生成的 AlgoStage Blueprint 未通过自动化沙箱执行或校验门禁，请根据以下具体错误清单修复，并输出修复后的完整合法 JSON：",
    "",
    "### 需要修复的问题：",
    ...issues.map((issue, idx) => `${idx + 1}. ${issue}`),
    "",
    "### 上一次生成的 JSON：",
    "```json",
    previousJson,
    "```",
    "",
    "请精准修正问题（确保 runnerCode 能在无依赖 JS 沙箱中无报错运行且调用 5~16 次 tracer.step），只输出完整合法 JSON。",
  ].join("\n");
}
