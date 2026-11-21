import assert from "node:assert/strict";
import test from "node:test";
import { buildAlgoStage } from "./builder";
import { createBinarySearchSpec } from "./demos/binary-search";
import { createReverseLinkedListSpec } from "./demos/reverse-linked-list";
import { renderStructureSvg } from "./renderers";
import { runAlgorithmInSandbox } from "./sandbox";

test("沙箱真实执行二分查找并产出准确 Trace（零脑算）", () => {
  const spec = createBinarySearchSpec();
  assert.ok(spec.frames.length >= 5);
  const last = spec.frames[spec.frames.length - 1];
  assert.equal(last.event, "found");
  assert.equal(last.vars.result, 5); // nums[5] === 31
  assert.equal(last.structure.type, "array");
});

test("沙箱真实执行单链表反转并记录反转边与最终表头", () => {
  const spec = createReverseLinkedListSpec();
  assert.ok(spec.frames.length >= 10);
  const last = spec.frames[spec.frames.length - 1];
  assert.equal(last.event, "done");
  assert.equal(last.vars.result, "Node(4)");
  assert.equal(last.structure.type, "linked-list");
  if (last.structure.type === "linked-list") {
    assert.equal(last.structure.edges.every((e) => e.state === "reversed"), true);
  }
});

test("沙箱拦截死循环与步数超限", () => {
  assert.throws(() => {
    runAlgorithmInSandbox({
      runnerCode: `while (true) { tracer.step({ line: 1, note: "loop", structure: { type: "array", items: [{ value: 1, state: "default" }], pointers: [] } }); }`,
      maxSteps: 5,
    });
  }, /超过上限/);
});

test("Tree 渲染器正确输出层次 SVG 节点与连线", () => {
  const rendered = renderStructureSvg("f1", {
    type: "tree",
    label: "Binary Tree",
    nodes: [
      { id: "r", value: 10, parentId: null, state: "active" },
      { id: "l", value: 5, parentId: "r", side: "left", state: "comparing" },
      { id: "ri", value: 15, parentId: "r", side: "right", state: "default" },
    ],
    pointers: [{ name: "curr", nodeId: "l", color: "#fbbf24" }],
  });
  assert.match(rendered.svgHtml, /<circle/);
  assert.match(rendered.svgHtml, /<line/);
  assert.ok(rendered.pointerCoords.curr);
});

test("Matrix 与 StackQueue 渲染器输出 DP 转移箭头与栈/队列 SVG", () => {
  const mat = renderStructureSvg("m1", {
    type: "matrix",
    label: "DP Table",
    rows: [
      [{ value: 1, state: "sorted" }, { value: 1, state: "sorted" }],
      [{ value: 1, state: "sorted" }, { value: 2, state: "active" }],
    ],
    activeCell: [1, 1],
    fromCells: [[0, 1], [1, 0]],
  });
  assert.match(mat.svgHtml, /mcell-1-1/);
  assert.match(mat.svgHtml, /marrow-0/);
  assert.match(mat.svgHtml, /marrow-1/);

  const stack = renderStructureSvg("s1", {
    type: "stack-queue",
    variant: "stack",
    label: "Monotonic Stack",
    items: [
      { id: "i1", label: "3", detail: "idx=0", state: "default" },
      { id: "i2", label: "7", detail: "idx=1", state: "active" },
    ],
    action: "push",
  });
  assert.match(stack.svgHtml, /◀ TOP/);
  assert.match(stack.svgHtml, /s1-sq-1/);
});

test("buildAlgoStage 为 swappedPair 生成数组元素弧线互换 GSAP 动画", async () => {
  const base = createBinarySearchSpec();
  const swapSpec = {
    ...base,
    frames: [
      {
        ...base.frames[0],
        event: "swap" as const,
        structure: {
          type: "array" as const,
          label: "QuickSort Swap",
          items: [
            { value: 9, state: "swapped" as const },
            { value: 3, state: "default" as const },
            { value: 2, state: "swapped" as const },
          ],
          pointers: [],
          swappedPair: [0, 2] as [number, number],
        },
      },
    ],
  };
  const out = await buildAlgoStage(swapSpec);
  assert.match(out.files["index.html"], /#frame-1-cell-0/);
  assert.match(out.files["index.html"], /#frame-1-cell-2/);
  assert.match(out.files["index.html"], /y: -26/);
});

test("buildAlgoStage 编译二分查找与链表反转均符合 HyperFrames 确定性契约", async () => {
  const bs = await buildAlgoStage(createBinarySearchSpec());
  assert.match(bs.files["index.html"], /data-composition-id="algo-binary-search"/);
  assert.match(bs.files["index.html"], /window\.__timelines\["algo-binary-search"\] = tl;/);
  assert.match(bs.files["index.html"], /VARIABLES WATCH/);

  const ll = await buildAlgoStage(createReverseLinkedListSpec());
  assert.match(ll.files["index.html"], /data-composition-id="algo-reverse-linked-list"/);
  assert.match(ll.files["index.html"], /marker-end="url\(#/);
});
