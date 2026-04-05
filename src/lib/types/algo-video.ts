// src/lib/types/algo-video.ts — 算法可视化视频完整类型定义

export interface AlgoVideoData {
  meta: {
    title: string;
    algorithm: string; // "BFS" | "DFS" | "BubbleSort" | "QuickSort" | ...
    aspectRatio: "16:9";
    templateId?: string; // 模板 ID，默认 "dark-tech"
    difficulty?: string;
  };
  narration: NarrationSegment[];
  steps: AlgoStep[];
}

export interface NarrationSegment {
  text: string;
  durationMs?: number;
  audioUrl?: string;
  timestamps?: WordTimestamp[];
}

export interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
}

export interface AlgoStep {
  stepIndex: number;
  description: string;
  grid: CellState[][];
  highlights?: [number, number][];
  annotation?: string;
  narrationIndex: number;
}

// 扩展 CellState 支持多种算法场景
export type CellState = {
  value: number;
  state:
    | "empty"          // 空格
    | "fresh"          // 默认/未处理 (BFS: 新鲜橘子; 排序: 普通元素)
    | "rotten"         // 已处理 (BFS: 已腐烂; 排序: 已排好序)
    | "just_rotten"    // 刚刚变化 (BFS: 刚感染; 排序: 刚交换)
    | "comparing"      // 正在比较的元素
    | "swapped"        // 刚交换完成
    | "sorted"         // 已排好序的元素
    | "active";        // 当前活跃/选中的元素
};
