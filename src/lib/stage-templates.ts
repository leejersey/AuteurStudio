import { buildAlgoStage } from "@/algo-stage/builder";
import { runAlgorithmInSandbox } from "@/algo-stage/sandbox";
import type { AlgoStageSpec } from "@/algo-stage/schema";
import { writeAlgoStageProject } from "@/algo-stage/agent";
import { writeArchStageProject } from "@/arch-stage/agent";
import { buildArchStage } from "@/arch-stage/builder";
import { eventLoopDemoSpec } from "@/arch-stage/demos/event-loop";
import { ragAgentDemoSpec } from "@/arch-stage/demos/rag-agent";
import type { ArchStageSpec } from "@/arch-stage/schema";
import { buildCodeStage } from "@/code-stage/builder";
import type { CodeStageSpec } from "@/code-stage/schema";
import { writeCodeStageProject } from "@/code-stage/agent";
import type { StageThemeId } from "@/code-stage/stage-themes";
import { STAGE_TEMPLATES, type TemplateId } from "./stage-template-catalog";

export { STAGE_TEMPLATES, type TemplateId, type StageTemplateMeta, type TemplateFieldDef } from "./stage-template-catalog";

function parseNumberList(raw: string | undefined, fallback: number[], minLen: number, maxLen: number): number[] {
  const nums = (raw || "")
    .split(/[,\s，]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
  if (nums.length < minLen) return fallback;
  return nums.slice(0, maxLen);
}

export function instantiateTemplateSpec(
  templateId: TemplateId,
  params: Record<string, string>,
  shikiTheme: StageThemeId = "dracula",
):
  | { engine: "code-stage"; spec: CodeStageSpec }
  | { engine: "algo-stage"; spec: AlgoStageSpec }
  | { engine: "arch-stage"; spec: ArchStageSpec } {
  const uid = `${templateId}-${Date.now().toString(36)}`;

  switch (templateId) {
    case "code-3-step": {
      const title = params.title?.trim() || "3 步掌握 TypeScript 泛型";
      const language = (params.language?.trim() || "typescript").toLowerCase();
      const filename = params.filename?.trim() || "generics.ts";
      return {
        engine: "code-stage",
        spec: {
          version: 1,
          meta: { id: uid, title, subtitle: "从重复重载到类型安全的泛型封装", language, shikiTheme, width: 1920, height: 1080, fps: 30 },
          steps: [
            {
              id: "step-1-pain",
              start: 0,
              duration: 7.5,
              badge: "01 · 重复痛点",
              headline: "不同类型要写一堆重复函数？",
              filename,
              code: `function firstNumber(arr: number[]): number {
  return arr[0];
}

function firstString(arr: string[]): string {
  return arr[0];
}`,
              focusLines: [1, 5],
              callout: { line: 1, title: "逻辑完全一致", body: "只是参数和返回类型不同，却被迫复制粘贴多份函数。", tone: "warn" },
              narration: "平时写代码经常遇到这种尴尬：逻辑一模一样，只因为类型不同就要写多份重复函数。",
            },
            {
              id: "step-2-generic",
              start: 7.5,
              duration: 8.5,
              badge: "02 · 引入类型参数",
              headline: "用泛型 <T> 把类型变成参数",
              filename,
              code: `function firstItem<T>(arr: T[]): T {
  return arr[0];
}

const n = firstItem([10, 20, 30]);
const s = firstItem(["a", "b", "c"]);`,
              focusLines: [1, 5, 6],
              callout: { line: 1, title: "自动类型推导", body: "调用时无需手写 <number>，编译器会自动推导 n 为 number、s 为 string。", tone: "info" },
              narration: "引入泛型参数 T 后，一份实现就能覆盖所有类型，而且调用时还能享受完整的自动类型推导。",
            },
            {
              id: "step-3-constraint",
              start: 16.0,
              duration: 8.5,
              badge: "03 · 泛型约束",
              headline: "用 extends 约束 T 必须具备的属性",
              filename,
              code: `function getLength<T extends { length: number }>(val: T): number {
  return val.length;
}

console.log(getLength("hello"));
console.log(getLength([1, 2, 3]));`,
              focusLines: [1, 5, 6],
              callout: { line: 1, title: "安全边界", body: "extends 既保留了泛型灵活性，又确保函数内可以安全访问 val.length。", tone: "success" },
              terminal: {
                title: "npx tsx generics.ts",
                command: "npx tsx generics.ts",
                lines: [
                  { text: "5", tone: "success" },
                  { text: "3", tone: "success" },
                ],
              },
              narration: "最后加上 extends 约束，就能安全访问 length 属性，彻底兼顾灵活性和类型安全。",
            },
          ],
        },
      };
    }

    case "code-before-after": {
      const title = params.title?.trim() || "告别深层 if 嵌套：卫语句重构";
      const language = (params.language?.trim() || "typescript").toLowerCase();
      const filename = params.filename?.trim() || "refactor.ts";
      return {
        engine: "code-stage",
        spec: {
          version: 1,
          meta: { id: uid, title, subtitle: "用提前返回让主干逻辑一眼看清", language, shikiTheme, width: 1920, height: 1080, fps: 30 },
          steps: [
            {
              id: "step-1-before",
              start: 0,
              duration: 8,
              badge: "BEFORE · 嵌套地狱",
              headline: "层层缩进让人找不到核心逻辑",
              filename,
              code: `function checkout(user, cart) {
  if (user) {
    if (user.isActive) {
      if (cart.items.length > 0) {
        return submitOrder(user, cart);
      }
    }
  }
  return { ok: false };
}`,
              focusLines: [2, 3, 4],
              callout: { line: 4, title: "箭头型代码", body: "三层条件把真正的核心逻辑 submitOrder 挤到了最深处。", tone: "warn" },
              narration: "这种层层嵌套的箭头型代码非常难读，真正的下单逻辑被埋在了最深一层。",
            },
            {
              id: "step-2-after",
              start: 8,
              duration: 8.5,
              badge: "AFTER · 卫语句重构",
              headline: "异常条件提前 return，主干零缩进",
              filename,
              code: `function checkout(user, cart) {
  if (!user || !user.isActive) return { ok: false };
  if (cart.items.length === 0) return { ok: false };

  return submitOrder(user, cart);
}`,
              focusLines: [2, 3, 5],
              callout: { line: 5, title: "快乐路径一目了然", body: "前置守卫拦截所有边界情况，主干逻辑平铺直叙。", tone: "success" },
              terminal: {
                title: "test checkout",
                command: "npm test -- checkout",
                lines: [
                  { text: "✓ 3 tests passed in 12ms", tone: "success" },
                  { text: "圈复杂度降低 50%，可读性大幅提升", tone: "dim" },
                ],
              },
              narration: "改成卫语句提前返回后，异常分支一眼扫清，核心的下单逻辑干干净净地落在最外层。",
            },
          ],
        },
      };
    }

    case "algo-binary-search": {
      const nums = parseNumberList(params.nums, [2, 7, 11, 15, 23, 31, 42], 3, 12).sort((a, b) => a - b);
      const target = Number.isFinite(Number(params.target)) ? Number(params.target) : nums[Math.floor(nums.length * 0.65)];
      const displayCode = `function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`;
      const runnerCode = `
const nums = ${JSON.stringify(nums)};
const target = ${JSON.stringify(target)};
function snap(l, r, m, foundIdx) {
  return {
    type: "array",
    label: "nums (target = " + target + ")",
    items: nums.map((value, idx) => ({
      value,
      state: idx === foundIdx ? "found" : (idx < l || idx > r) ? "dim" : idx === m ? "comparing" : "active",
    })),
    pointers: [
      { name: "L", index: Math.max(0, Math.min(nums.length - 1, l)), color: "#bd93f9" },
      ...(m !== null ? [{ name: "mid", index: m, color: "#f1fa8c" }] : []),
      { name: "R", index: Math.max(0, Math.min(nums.length - 1, r)), color: "#ff79c6" },
    ],
  };
}
let left = 0, right = nums.length - 1, found = false;
tracer.step({ line: 2, event: "init", note: "初始化区间 [0, " + right + "]，寻找 " + target, narration: "初始化左右指针覆盖整个有序数组，准备查找目标 " + target + "。", vars: { target, left, right, mid: null }, structure: snap(left, right, null, -1) });
while (left <= right) {
  const mid = Math.floor((left + right) / 2);
  const v = nums[mid];
  tracer.step({ line: 4, event: "compare", note: "中点 mid=" + mid + "，比较 nums[" + mid + "]=" + v + " 与 " + target, narration: "计算中点索引 " + mid + "，值为 " + v + "，与目标 " + target + " 比较。", vars: { target, left, right, mid, val: v }, structure: snap(left, right, mid, -1) });
  if (v === target) {
    found = true;
    tracer.step({ line: 5, event: "found", note: "命中目标！返回索引 " + mid, narration: "精准命中目标 " + target + "，直接返回索引 " + mid + "。", vars: { target, left, right, mid, result: mid }, structure: snap(left, right, mid, mid) });
    break;
  } else if (v < target) {
    left = mid + 1;
    tracer.step({ line: 6, event: "move", note: v + " < " + target + "，left 右移至 " + left, narration: v + " 小于目标，排除左半区，左指针跳到 " + left + "。", vars: { target, left, right, mid }, structure: snap(left, right, null, -1) });
  } else {
    right = mid - 1;
    tracer.step({ line: 7, event: "move", note: v + " > " + target + "，right 左移至 " + right, narration: v + " 大于目标，排除右半区，右指针收紧到 " + right + "。", vars: { target, left, right, mid }, structure: snap(left, right, null, -1) });
  }
}
if (!found) {
  tracer.step({ line: 9, event: "done", note: "区间为空，未找到目标，返回 -1", narration: "左右指针交叉，数组中不存在目标 " + target + "，返回负一。", vars: { target, left, right, result: -1 }, structure: snap(left, right, null, -1) });
}`;
      const exec = runAlgorithmInSandbox({ runnerCode });
      return {
        engine: "algo-stage",
        spec: {
          version: 1,
          meta: { id: uid, title: `二分查找目标 ${target}`, algorithm: "BINARY SEARCH", language: "javascript", filename: "binarySearch.js", shikiTheme, complexity: { time: "O(log n)", space: "O(1)" }, width: 1920, height: 1080, fps: 30 },
          code: displayCode,
          frames: exec.frames,
        },
      };
    }

    case "algo-bubble-sort": {
      const nums = parseNumberList(params.nums, [9, 4, 7, 2, 5], 3, 7);
      const displayCode = `function bubbleSort(nums) {
  const n = nums.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (nums[j] > nums[j + 1]) {
        [nums[j], nums[j + 1]] = [nums[j + 1], nums[j]];
      }
    }
  }
  return nums;
}`;
      const runnerCode = `
const nums = ${JSON.stringify(nums)};
const n = nums.length;
function snap(sortedFrom, j, swappedPair) {
  return {
    type: "array",
    label: "Bubble Sort (Swap Arc Animation)",
    items: nums.map((value, idx) => ({
      value,
      state: swappedPair && (idx === swappedPair[0] || idx === swappedPair[1])
        ? "swapped"
        : idx >= sortedFrom
          ? "sorted"
          : (idx === j || idx === j + 1)
            ? "comparing"
            : "default",
    })),
    pointers: j !== null ? [
      { name: "j", index: j, color: "#f1fa8c" },
      { name: "j+1", index: j + 1, color: "#ff79c6" },
    ] : [],
    ...(swappedPair ? { swappedPair } : {}),
  };
}
tracer.step({ line: 2, event: "init", note: "初始无序数组 [" + nums.join(", ") + "]", narration: "准备对数组执行冒泡排序，每轮把最大的元素冒泡到右侧。", vars: { n, i: 0, j: 0 }, structure: snap(n, null, null) });
for (let i = 0; i < n - 1; i++) {
  for (let j = 0; j < n - 1 - i; j++) {
    if (nums[j] > nums[j + 1]) {
      const a = nums[j], b = nums[j + 1];
      nums[j] = b; nums[j + 1] = a;
      tracer.step({ line: 6, event: "swap", note: a + " > " + b + "，交换索引 " + j + " 与 " + (j + 1), narration: a + " 大于 " + b + "，将它们原地交换位置。", vars: { i, j, swapped: a + "↔" + b }, structure: snap(n - i, j, [j, j + 1]) });
    }
  }
}
tracer.step({ line: 10, event: "done", note: "排序完成：[" + nums.join(", ") + "]", narration: "全部轮次执行完毕，数组已经严格升序排列。", vars: { result: nums.join(",") }, structure: snap(0, null, null) });`;
      const exec = runAlgorithmInSandbox({ runnerCode });
      return {
        engine: "algo-stage",
        spec: {
          version: 1,
          meta: { id: uid, title: "冒泡排序：相邻交换可视化", algorithm: "BUBBLE SORT", language: "javascript", filename: "bubbleSort.js", shikiTheme, complexity: { time: "O(n²)", space: "O(1)" }, width: 1920, height: 1080, fps: 30 },
          code: displayCode,
          frames: exec.frames,
        },
      };
    }

    case "algo-reverse-list": {
      const vals = parseNumberList(params.nodes, [10, 20, 30, 40], 3, 6);
      const displayCode = `function reverseList(head) {
  let prev = null, curr = head;
  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`;
      const runnerCode = `
const vals = ${JSON.stringify(vals)};
const ids = vals.map((_, i) => "n" + (i + 1));
const valMap = Object.fromEntries(ids.map((id, i) => [id, vals[i]]));
const nextMap = Object.fromEntries(ids.map((id, i) => [id, ids[i + 1] ?? null]));
const rev = new Set();
function snap(prev, curr, next, activeEdge) {
  const edges = [];
  for (const id of ids) {
    if (nextMap[id]) {
      const k = id + "->" + nextMap[id];
      edges.push({ from: id, to: nextMap[id], state: k === activeEdge ? "active" : rev.has(k) ? "reversed" : "default" });
    }
  }
  return {
    type: "linked-list",
    label: "Singly Linked List (" + vals.join(" → ") + ")",
    nodes: ids.map((id) => ({ id, value: valMap[id], state: id === curr ? "active" : id === prev ? "sorted" : id === next ? "comparing" : "default" })),
    edges,
    pointers: [
      { name: "prev", nodeId: prev, color: "#50fa7b" },
      { name: "curr", nodeId: curr, color: "#8be9fd" },
      ...(next !== undefined ? [{ name: "next", nodeId: next, color: "#f1fa8c" }] : []),
    ],
  };
}
let prev = null, curr = ids[0];
tracer.step({ line: 2, event: "init", note: "初始化 prev = null, curr = " + valMap[curr], narration: "开始时 prev 为空，curr 指向头节点 " + valMap[curr] + "。", vars: { prev: "null", curr: valMap[curr] }, structure: snap(prev, curr, undefined, null) });
while (curr !== null) {
  const next = nextMap[curr];
  nextMap[curr] = prev;
  const key = prev ? curr + "->" + prev : null;
  if (key) rev.add(key);
  tracer.step({ line: 5, event: "swap", note: "翻转指针：" + valMap[curr] + ".next → " + (prev ? valMap[prev] : "null"), narration: "保存 next 后把节点 " + valMap[curr] + " 的指针调头指向前驱。", vars: { prev: prev ? valMap[prev] : "null", curr: valMap[curr], next: next ? valMap[next] : "null" }, structure: snap(prev, curr, next, key) });
  prev = curr; curr = next;
  tracer.step({ line: 7, event: "move", note: "指针整体右移：prev=" + valMap[prev] + ", curr=" + (curr ? valMap[curr] : "null"), narration: "双指针同步前进，准备处理下一个节点。", vars: { prev: valMap[prev], curr: curr ? valMap[curr] : "null" }, structure: snap(prev, curr, undefined, null) });
}
tracer.step({ line: 9, event: "done", note: "反转完成，新表头为 " + valMap[prev], narration: "链表反转完成，返回新的表头节点 " + valMap[prev] + "。", vars: { result: valMap[prev] }, structure: snap(prev, null, undefined, null) });`;
      const exec = runAlgorithmInSandbox({ runnerCode });
      return {
        engine: "algo-stage",
        spec: {
          version: 1,
          meta: { id: uid, title: "原地反转单链表", algorithm: "LINKED LIST", language: "javascript", filename: "reverseList.js", shikiTheme, complexity: { time: "O(n)", space: "O(1)" }, width: 1920, height: 1080, fps: 30 },
          code: displayCode,
          frames: exec.frames,
        },
      };
    }

    case "algo-dp-grid": {
      const m = Math.max(2, Math.min(4, Number.parseInt(params.rows || "3", 10) || 3));
      const n = Math.max(2, Math.min(5, Number.parseInt(params.cols || "4", 10) || 4));
      const displayCode = `function uniquePaths(m, n) {
  const dp = Array.from({ length: m }, () => Array(n).fill(1));
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }
  return dp[m - 1][n - 1];
}`;
      const runnerCode = `
const m = ${m}, n = ${n};
const dp = Array.from({ length: m }, (_, r) => Array.from({ length: n }, (_, c) => (r === 0 || c === 0 ? 1 : 0)));
function snap(ar, ac, fromCells) {
  return {
    type: "matrix",
    label: "dp[i][j] = dp[i-1][j] + dp[i][j-1]",
    rows: dp.map((row, r) => row.map((v, c) => ({
      value: v === 0 ? "·" : v,
      state: ar === r && ac === c ? "active" : (fromCells && fromCells.some(([fr, fc]) => fr === r && fc === c)) ? "comparing" : v > 0 ? "sorted" : "default",
    }))),
    ...(ar !== null ? { activeCell: [ar, ac], fromCells } : {}),
  };
}
tracer.step({ line: 2, event: "init", note: "初始化首行与首列为 1（只有一条直达路径）", narration: "边界条件很简单：第一行和第一列的每个格子都只有 1 种走法。", vars: { m, n }, structure: snap(null, null, null) });
for (let i = 1; i < m; i++) {
  for (let j = 1; j < n; j++) {
    dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    tracer.step({ line: 5, event: "update", note: "dp[" + i + "][" + j + "] = " + dp[i - 1][j] + " + " + dp[i][j - 1] + " = " + dp[i][j], narration: "格子 (" + i + "," + j + ") 的路径数等于上方与左方之和，得到 " + dp[i][j] + "。", vars: { i, j, top: dp[i - 1][j], left: dp[i][j - 1], val: dp[i][j] }, structure: snap(i, j, [[i - 1, j], [i, j - 1]]) });
  }
}
tracer.step({ line: 8, event: "found", note: "右下角终点总路径数：" + dp[m - 1][n - 1], narration: "填表完成，到达右下角共有 " + dp[m - 1][n - 1] + " 条不同路径。", vars: { result: dp[m - 1][n - 1] }, structure: snap(m - 1, n - 1, []) });`;
      const exec = runAlgorithmInSandbox({ runnerCode });
      return {
        engine: "algo-stage",
        spec: {
          version: 1,
          meta: { id: uid, title: `DP 网格不同路径 (${m}×${n})`, algorithm: "DYNAMIC PROGRAMMING", language: "javascript", filename: "uniquePaths.js", shikiTheme, complexity: { time: "O(m·n)", space: "O(m·n)" }, width: 1920, height: 1080, fps: 30 },
          code: displayCode,
          frames: exec.frames,
        },
      };
    }

    case "arch-event-loop": {
      const cloned = structuredClone(eventLoopDemoSpec);
      cloned.meta.id = uid;
      cloned.meta.theme = shikiTheme;
      if (params.title?.trim()) cloned.meta.title = params.title.trim();
      return { engine: "arch-stage", spec: cloned };
    }

    case "arch-rag-agent": {
      const cloned = structuredClone(ragAgentDemoSpec);
      cloned.meta.id = uid;
      cloned.meta.theme = shikiTheme;
      if (params.title?.trim()) cloned.meta.title = params.title.trim();
      return { engine: "arch-stage", spec: cloned };
    }
  }
}

export async function compileTemplateToDir(
  templateId: TemplateId,
  params: Record<string, string>,
  shikiTheme: StageThemeId,
  outDir: string,
  enablePackaging = false,
): Promise<{ engine: "code-stage" | "algo-stage" | "arch-stage"; duration: number; spec: CodeStageSpec | AlgoStageSpec | ArchStageSpec }> {
  const created = instantiateTemplateSpec(templateId, params, shikiTheme);
  const packaging = enablePackaging
    ? {
        enableIntro: true,
        introDuration: 2.5,
        enableOutro: true,
        outroDuration: 3.0,
        outroCta: "点赞 · 收藏 · 关注，持续拆解硬核编程",
        bgmFile: "bgm-tech-01.wav",
        bgmLevel: "balanced" as const,
      }
    : undefined;

  if (created.engine === "code-stage") {
    const spec: CodeStageSpec = { ...created.spec, ...(packaging ? { packaging } : {}) };
    const bundle = await buildCodeStage(spec);
    writeCodeStageProject(outDir, spec, bundle);
    return { engine: "code-stage", duration: bundle.duration, spec };
  }

  if (created.engine === "arch-stage") {
    const spec: ArchStageSpec = { ...created.spec, ...(packaging ? { packaging } : { packaging: undefined }) };
    const bundle = await buildArchStage(spec);
    writeArchStageProject(outDir, spec, bundle);
    return { engine: "arch-stage", duration: bundle.duration, spec };
  }

  const spec: AlgoStageSpec = { ...created.spec, ...(packaging ? { packaging } : {}) };
  const bundle = await buildAlgoStage(spec);
  writeAlgoStageProject(outDir, spec, bundle);
  return { engine: "algo-stage", duration: bundle.duration, spec };
}
