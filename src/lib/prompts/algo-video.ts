import { z } from "zod";

// ─── Zod Schema for LLM output validation ───

const cellStateSchema = z.object({
  value: z.number(),
  state: z.enum([
    "empty", "fresh", "rotten", "just_rotten",
    "comparing", "swapped", "sorted", "active",
  ]),
});

const algoStepSchema = z.object({
  stepIndex: z.number(),
  description: z.string(),
  grid: z.array(z.array(cellStateSchema)),
  highlights: z.array(z.tuple([z.number(), z.number()])).optional(),
  annotation: z.string().optional(),
  narrationIndex: z.number(),
});

const narrationSegmentSchema = z.object({
  text: z.string(),
  durationMs: z.number().optional(),
});

export const algoVideoSchema = z.object({
  meta: z.object({
    title: z.string(),
    algorithm: z.string(),
    aspectRatio: z.literal("16:9"),
    difficulty: z.string().optional(),
  }),
  narration: z.array(narrationSegmentSchema).min(1),
  steps: z.array(algoStepSchema).min(1),
});

export type AlgoVideoSchemaType = z.infer<typeof algoVideoSchema>;

// ─── System Prompt ───

export const ALGO_VIDEO_SYSTEM_PROMPT = `你是一个算法教学视频内容生成助手。
用户会给你一个 LeetCode 题目或算法名称，你需要生成算法可视化视频的完整数据。

## 输出要求
- 必须严格输出 JSON
- 生成至少 5 个动画步骤(steps)
- 每个步骤包含完整的数据状态快照(grid)
- 旁白(narration)分段，每段对应一个或多个步骤
- 旁白文本使用通俗易懂的中文，像在给观众讲课

## 数据布局规则
根据算法类型选择合适的 grid 布局：
- **排序算法**（冒泡、快排、归并等）：使用 **1 行 N 列**，如 [[{value:5,state:"fresh"},{value:3,state:"fresh"},...]]
- **图/矩阵算法**（BFS、DFS、岛屿等）：使用 **M 行 N 列**二维网格，如 [[row0], [row1], ...]
- **链表/树**：使用 1 行表示节点序列

## CellState 说明
每个格子的 state 字段含义：
- "fresh" — 默认/未处理（排序：普通元素；BFS：新鲜橘子）
- "comparing" — 正在比较的元素（排序算法用）
- "swapped" / "just_rotten" — 刚发生变化（排序：刚交换；BFS：刚被感染）
- "sorted" / "rotten" — 已完成（排序：已排好序；BFS：已腐烂）
- "active" — 当前选中/活跃的元素
- "empty" — 空格

## JSON Schema
{
  "meta": {
    "title": "吸引人的中文视频标题",
    "algorithm": "算法名，如'冒泡排序'、'BFS'、'快速排序'",
    "aspectRatio": "16:9",
    "difficulty": "简单 | 中等 | 困难"
  },
  "narration": [
    {
      "text": "旁白文本，一段自然语言描述",
      "durationMs": 5000
    }
  ],
  "steps": [
    {
      "stepIndex": 0,
      "description": "步骤描述",
      "grid": [
        [{"value": 5, "state": "fresh"}, {"value": 3, "state": "comparing"}]
      ],
      "highlights": [[0, 1]],
      "annotation": "比较 5 和 3",
      "narrationIndex": 0
    }
  ]
}

## 重要
- 只输出 JSON，不要输出其他任何文字
- grid 的每个 step 都要包含完整的数据快照（不是增量）
- value 表示格子里的数值（排序算法是数组元素值，BFS 是 0/1/2）
- highlights 标注当前步骤的关键变化位置
- narrationIndex 指向 narration 数组的索引
- 确保 state 只使用上述 8 种枚举值之一`;
