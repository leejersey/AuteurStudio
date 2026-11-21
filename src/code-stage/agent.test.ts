import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runCodeStageAgentLoop, type LlmTextClient } from "./agent";
import { pythonDecoratorDemoSpec } from "./demos/python-decorator";
import { validateCodeStageSemantics } from "./validator";

test("validateCodeStageSemantics 拦截超长代码行、过多行数与无演进步骤", () => {
  const badSpec = {
    ...pythonDecoratorDemoSpec,
    steps: [
      {
        ...pythonDecoratorDemoSpec.steps[0],
        code: `const veryLongLine = "${"a".repeat(85)}"`,
        focusLines: [1],
        callout: { line: 1, title: "test", body: "test", tone: "info" as const },
      },
      {
        ...pythonDecoratorDemoSpec.steps[1],
        code: `const veryLongLine = "${"a".repeat(85)}"`,
        focusLines: [1],
        callout: { line: 1, title: "test", body: "test", tone: "info" as const },
      },
    ],
  };

  const issues = validateCodeStageSemantics(badSpec);
  assert.ok(issues.some((i) => i.message.includes("超出上限 76 字符")));
  assert.ok(issues.some((i) => i.message.includes("缺少视觉演进")));
});

test("runCodeStageAgentLoop 在第 1 轮校验失败时回传精准诊断并在第 2 轮自动修复通过", async () => {
  const outDir = join(tmpdir(), `code-stage-agent-test-${Date.now()}`);
  const receivedPrompts: string[] = [];

  // 第 1 轮故意返回越界 focusLines，第 2 轮返回合法 Spec
  const brokenSpec = {
    ...pythonDecoratorDemoSpec,
    steps: [
      { ...pythonDecoratorDemoSpec.steps[0], focusLines: [99] },
      ...pythonDecoratorDemoSpec.steps.slice(1),
    ],
  };

  let callCount = 0;
  const mockLlm: LlmTextClient = {
    async generate({ prompt }) {
      receivedPrompts.push(prompt);
      callCount++;
      if (callCount === 1) {
        return `\`\`\`json\n${JSON.stringify(brokenSpec)}\n\`\`\``;
      }
      return `\`\`\`json\n${JSON.stringify(pythonDecoratorDemoSpec)}\n\`\`\``;
    },
  };

  try {
    const result = await runCodeStageAgentLoop({
      request: { topic: "Python 装饰器", language: "python" },
      outDir,
      maxRounds: 3,
      runHyperFramesLint: true,
      runHyperFramesInspect: false,
      llmClient: mockLlm,
    });

    assert.equal(result.rounds, 2);
    assert.equal(result.trace.length, 2);
    assert.equal(result.trace[0].phase, "generate");
    assert.equal(result.trace[0].status, "failed");
    assert.equal(result.trace[0].issues[0].gate, "schema");

    // 确认第 2 轮修复 prompt 中包含第 1 轮的具体诊断信息
    assert.match(receivedPrompts[1], /超出代码总行数/);

    assert.equal(result.trace[1].phase, "repair");
    assert.equal(result.trace[1].status, "passed");
    assert.ok(existsSync(join(outDir, "index.html")));
    assert.ok(existsSync(join(outDir, "styles.css")));
    assert.ok(existsSync(join(outDir, "assets/vendor/gsap.min.js")));
    assert.ok(existsSync(join(outDir, "assets/fonts/noto-sans-sc.woff2")));
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
