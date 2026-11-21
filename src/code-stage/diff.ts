/**
 * 行级 LCS Diff 引擎 — 为 CodeStage 的 Magic Move（FLIP 位移）提供确定性行映射。
 * 给定相邻两步的代码文本，计算新代码中每一行是：
 * - unchanged: 来自上一步的第 prevIndex 行（0-based），用于平滑位移
 * - added: 本步新增的行，用于高亮滑入
 * 同时返回 removed 列表，记录上一步中被移除的行号。
 */

export type DiffLineKind = "unchanged" | "added";

export interface DiffLineEntry {
  /** 当前步骤中的行号（0-based） */
  currIndex: number;
  /** 若来自上一步，则为上一步中的行号（0-based）；新增行为 null */
  prevIndex: number | null;
  kind: DiffLineKind;
  text: string;
}

export interface CodeStepDiff {
  lines: DiffLineEntry[];
  removedPrevIndices: number[];
  hasChanges: boolean;
}

export function diffCodeLines(prevCode: string | null, currCode: string): CodeStepDiff {
  const currLines = currCode.split("\n");

  if (prevCode === null) {
    return {
      lines: currLines.map((text, currIndex) => ({
        currIndex,
        prevIndex: null,
        kind: "added",
        text,
      })),
      removedPrevIndices: [],
      hasChanges: true,
    };
  }

  const prevLines = prevCode.split("\n");
  const m = prevLines.length;
  const n = currLines.length;

  // 标准 LCS DP 表
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (prevLines[i] === currLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = dp[i + 1][j] >= dp[i][j + 1] ? dp[i + 1][j] : dp[i][j + 1];
      }
    }
  }

  // 回溯，构建 currIndex -> prevIndex 映射
  const matchedPrevForCurr = new Map<number, number>();
  const matchedPrevSet = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (prevLines[i] === currLines[j]) {
      matchedPrevForCurr.set(j, i);
      matchedPrevSet.add(i);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }

  const lines: DiffLineEntry[] = currLines.map((text, currIndex) => {
    const prevIndex = matchedPrevForCurr.get(currIndex) ?? null;
    return {
      currIndex,
      prevIndex,
      kind: prevIndex !== null ? "unchanged" : "added",
      text,
    };
  });

  const removedPrevIndices: number[] = [];
  for (let p = 0; p < m; p++) {
    if (!matchedPrevSet.has(p)) {
      removedPrevIndices.push(p);
    }
  }

  const hasChanges =
    removedPrevIndices.length > 0 ||
    lines.some((line) => line.kind === "added" || line.prevIndex !== line.currIndex);

  return { lines, removedPrevIndices, hasChanges };
}
