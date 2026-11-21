import assert from "node:assert/strict";
import test from "node:test";
import { diffCodeLines } from "./diff";
import { highlightCode } from "./highlighter";
import { buildCodeStage } from "./builder";
import { codeStageSpecSchema } from "./schema";
import { pythonDecoratorDemoSpec } from "./demos/python-decorator";

test("diffCodeLines 准确识别保留行位移与新增/删除行", () => {
  const prev = ["import time", "", "def foo():", "    pass"].join("\n");
  const curr = ["import time", "from functools import wraps", "", "@timer", "def foo():", "    pass"].join("\n");
  const diff = diffCodeLines(prev, curr);

  assert.equal(diff.hasChanges, true);
  assert.deepEqual(diff.removedPrevIndices, []);
  // "def foo():" 从原 index 2 移到了 index 4
  const defLine = diff.lines.find((l) => l.text === "def foo():");
  assert.ok(defLine);
  assert.equal(defLine.kind, "unchanged");
  assert.equal(defLine.prevIndex, 2);
  assert.equal(defLine.currIndex, 4);

  const wrapsLine = diff.lines.find((l) => l.text.includes("wraps"));
  assert.ok(wrapsLine);
  assert.equal(wrapsLine.kind, "added");
  assert.equal(wrapsLine.prevIndex, null);
});

test("codeStageSpecSchema 拒绝重叠时间区间和越界 focusLines", () => {
  assert.throws(() => {
    codeStageSpecSchema.parse({
      ...pythonDecoratorDemoSpec,
      steps: [
        { ...pythonDecoratorDemoSpec.steps[0], start: 0, duration: 5 },
        { ...pythonDecoratorDemoSpec.steps[1], start: 4.5, duration: 5 },
      ],
    });
  }, /早于上一步结束时间/);

  assert.throws(() => {
    codeStageSpecSchema.parse({
      ...pythonDecoratorDemoSpec,
      steps: [
        { ...pythonDecoratorDemoSpec.steps[0], focusLines: [999] },
      ],
    });
  }, /超出代码总行数/);
});

test("highlightCode 使用 Shiki 生成确定性带色 Token", async () => {
  const res = await highlightCode("def hello(x):\n    return x + 1", "python", "tokyo-night");
  assert.equal(res.lines.length, 2);
  assert.ok(res.lines[0].some((t) => t.content === "def" && t.color.startsWith("#")));
  assert.ok(res.bg.startsWith("#"));
});

test("buildCodeStage 输出符合 HyperFrames 确定性契约的完整工程", async () => {
  const bundle = await buildCodeStage(pythonDecoratorDemoSpec);

  assert.equal(bundle.width, 1920);
  assert.equal(bundle.height, 1080);
  assert.equal(bundle.fps, 30);
  assert.equal(bundle.duration, 36);

  const html = bundle.files["index.html"];

  assert.match(html, /data-composition-id="python-decorator-demo"/);
  assert.match(html, /data-duration="36"/);
  assert.match(html, /class="stage-bg"/);
  assert.match(html, /id="step-3-sugar-terminal"/);
  assert.match(html, /id="step-1-pain-callout"/);

  assert.match(html, /gsap\.timeline\(\{ paused: true \}\)/);
  assert.match(html, /window\.__timelines\["python-decorator-demo"\] = tl;/);
  assert.doesNotMatch(html, /repeat:\s*-1/);
});

test("buildCodeStage 支持 9:16 竖屏短视频模式 (1080x1920)", async () => {
  const portraitBundle = await buildCodeStage({
    ...pythonDecoratorDemoSpec,
    meta: { ...pythonDecoratorDemoSpec.meta, width: 1080, height: 1920 },
  });
  assert.equal(portraitBundle.width, 1080);
  assert.equal(portraitBundle.height, 1920);
  assert.match(portraitBundle.files["index.html"], /data-width="1080"/);
  assert.match(portraitBundle.files["index.html"], /data-height="1920"/);
  assert.match(portraitBundle.files["styles.css"], /9:16 竖屏短视频自适应排版/);
});
