import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { LlmTextClient } from "../code-stage/agent";
import { runAlgoStageAgentLoop } from "./agent";

test("runAlgoStageAgentLoop 捕获沙箱运行时异常并回传精准堆栈，第 2 轮自动修复并跑通 HyperFrames lint", async () => {
  const outDir = join(tmpdir(), `algo-stage-agent-test-${Date.now()}`);
  const prompts: string[] = [];

  const brokenBlueprint = {
    meta: {
      id: "algo-tree-dfs",
      title: "二叉树前序遍历",
      algorithm: "TREE DFS",
      language: "javascript",
      filename: "preorder.js",
      shikiTheme: "tokyo-night",
      complexity: { time: "O(n)", space: "O(h)" },
    },
    code: [
      "function preorder(node) {",
      "  if (!node) return;",
      "  visit(node.val);",
      "  preorder(node.left);",
      "  preorder(node.right);",
      "}",
    ].join("\n"),
    // 故意制造运行时 ReferenceError
    runnerCode: "const x = notDefinedVar + 1;",
  };

  const fixedBlueprint = {
    ...brokenBlueprint,
    runnerCode: `
const nodes = [
  { id: "r", value: 10, parentId: null },
  { id: "l", value: 5, parentId: "r", side: "left" },
  { id: "ri", value: 15, parentId: "r", side: "right" },
];
const visited = [];
function snap(currId) {
  return {
    type: "tree",
    label: "Binary Tree Preorder DFS",
    nodes: nodes.map((n) => ({
      ...n,
      state: n.id === currId ? "active" : visited.includes(n.value) ? "sorted" : "default",
    })),
    pointers: currId ? [{ name: "curr", nodeId: currId, color: "#fbbf24" }] : [],
  };
}
for (const n of nodes) {
  visited.push(n.value);
  tracer.step({
    line: 3,
    event: "update",
    note: "访问节点 " + n.value,
    narration: "前序遍历访问当前节点 " + n.value + "，并记录到结果序列。",
    vars: { curr: n.value, visited: visited.join(",") },
    structure: snap(n.id),
  });
}
`,
  };

  let calls = 0;
  const mockLlm: LlmTextClient = {
    async generate({ prompt }) {
      prompts.push(prompt);
      calls++;
      return `\`\`\`json\n${JSON.stringify(calls === 1 ? brokenBlueprint : fixedBlueprint)}\n\`\`\``;
    },
  };

  try {
    const result = await runAlgoStageAgentLoop({
      request: { topic: "二叉树前序遍历", structureHint: "tree" },
      outDir,
      maxRounds: 3,
      runHyperFramesLint: true,
      runHyperFramesInspect: false,
      llmClient: mockLlm,
    });

    assert.equal(result.rounds, 2);
    assert.equal(result.trace[0].status, "failed");
    assert.equal(result.trace[0].issues[0].gate, "sandbox");
    assert.match(prompts[1], /notDefinedVar/);

    assert.equal(result.trace[1].status, "passed");
    assert.equal(result.spec.frames.length, 3);
    assert.ok(existsSync(join(outDir, "index.html")));
    assert.ok(existsSync(join(outDir, "spec.json")));
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
