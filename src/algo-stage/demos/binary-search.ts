import { runAlgorithmInSandbox } from "../sandbox";
import type { AlgoStageSpec } from "../schema";

const DISPLAY_CODE = `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`;

const RUNNER_CODE = `
const nums = [3, 8, 12, 19, 25, 31, 42, 56, 68];
const target = 31;

function makeArray(left, right, mid, foundIdx) {
  return {
    type: "array",
    label: "nums (sorted, target = 31)",
    items: nums.map((value, idx) => {
      let state = "default";
      if (idx === foundIdx) state = "found";
      else if (idx < left || idx > right) state = "dim";
      else if (idx === mid) state = "comparing";
      else state = "active";
      return { value, state };
    }),
    pointers: [
      { name: "L", index: Math.max(0, Math.min(nums.length - 1, left)), color: "#38bdf8" },
      ...(mid !== null ? [{ name: "mid", index: mid, color: "#fbbf24" }] : []),
      { name: "R", index: Math.max(0, Math.min(nums.length - 1, right)), color: "#a78bfa" },
    ],
  };
}

let left = 0;
let right = nums.length - 1;

tracer.step({
  line: 3,
  event: "init",
  note: "初始化搜索区间 [0, 8]，目标值 target = 31",
  narration: "先初始化左右指针 L 和 R，覆盖整个有序数组，我们要查找目标值 31。",
  vars: { target, left, right, mid: null, "nums[mid]": null },
  structure: makeArray(left, right, null, -1),
});

while (left <= right) {
  const mid = Math.floor((left + right) / 2);
  const val = nums[mid];

  tracer.step({
    line: 6,
    event: "compare",
    note: "计算中点 mid = " + mid + "，比较 nums[" + mid + "] (" + val + ") 与 " + target,
    narration: "取当前区间中点 mid 等于 " + mid + "，元素值是 " + val + "，拿它和目标 31 做比较。",
    vars: { target, left, right, mid, "nums[mid]": val },
    structure: makeArray(left, right, mid, -1),
  });

  if (val === target) {
    tracer.step({
      line: 9,
      event: "found",
      note: "命中目标！nums[" + mid + "] === 31，返回索引 " + mid,
      narration: "正好相等！我们只用了三次比较就精准命中了目标 31，直接返回索引 " + mid + "。",
      vars: { target, left, right, mid, "nums[mid]": val, result: mid },
      structure: makeArray(left, right, mid, mid),
    });
    break;
  } else if (val < target) {
    left = mid + 1;
    tracer.step({
      line: 11,
      event: "move",
      note: val + " < 31，排除左半区，left 移动到 " + left,
      narration: val + " 小于 31，说明目标一定在右半边，把左指针直接跳到 mid 加 1，排除一半元素。",
      vars: { target, left, right, mid, "nums[mid]": val },
      structure: makeArray(left, right, null, -1),
    });
  } else {
    right = mid - 1;
    tracer.step({
      line: 13,
      event: "move",
      note: val + " > 31，排除右半区，right 移动到 " + right,
      narration: val + " 大于 31，目标在左半边，把右指针收紧到 mid 减 1，继续折半。",
      vars: { target, left, right, mid, "nums[mid]": val },
      structure: makeArray(left, right, null, -1),
    });
  }
}
`;

export function createBinarySearchSpec(): AlgoStageSpec {
  const exec = runAlgorithmInSandbox({ runnerCode: RUNNER_CODE });
  return {
    version: 1,
    meta: {
      id: "algo-binary-search",
      title: "二分查找：每次排除一半元素",
      algorithm: "BINARY SEARCH",
      language: "javascript",
      filename: "binarySearch.js",
      shikiTheme: "dracula",
      complexity: { time: "O(log n)", space: "O(1)" },
      width: 1920,
      height: 1080,
      fps: 30,
    },
    code: DISPLAY_CODE,
    frames: exec.frames,
  };
}
