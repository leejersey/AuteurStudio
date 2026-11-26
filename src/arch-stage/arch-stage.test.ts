import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runArchStageAgent } from "./agent";
import { buildArchStage } from "./builder";
import { eventLoopDemoSpec } from "./demos/event-loop";
import { ragAgentDemoSpec } from "./demos/rag-agent";
import { archStageSpecSchema, validateArchSpecSemantics } from "./schema";

test("ArchStage: Event Loop 与 RAG Agent 样片均通过 Schema 与拓扑校验", () => {
  for (const demo of [eventLoopDemoSpec, ragAgentDemoSpec]) {
    const parsed = archStageSpecSchema.parse(demo);
    const issues = validateArchSpecSemantics(parsed);
    assert.equal(issues.length, 0, JSON.stringify(issues));
  }
});

test("ArchStage: 拦截重复网格坐标与非法连线引用", () => {
  const broken = structuredClone(eventLoopDemoSpec);
  broken.nodes[1].col = broken.nodes[0].col;
  broken.nodes[1].row = broken.nodes[0].row;
  broken.steps[0].packets.push({ edgeId: "non-existent-edge", label: "oops", tone: "danger" });

  const issues = validateArchSpecSemantics(broken);
  assert.ok(issues.some((i) => i.gate === "topology" && i.message.includes("冲突")));
  assert.ok(issues.some((i) => i.gate === "step-ref" && i.message.includes("non-existent-edge")));
});

test("ArchStage: 支持 16:9 横屏与 9:16 竖屏编译并包含数据包、片头片尾与 BGM", async () => {
  const landscape = await buildArchStage(eventLoopDemoSpec);
  assert.equal(landscape.width, 1920);
  assert.equal(landscape.height, 1080);
  assert.ok(landscape.indexHtml.includes('id="pkt-0-0"'));
  assert.ok(landscape.indexHtml.includes('id="pkg-intro"'));
  assert.ok(landscape.indexHtml.includes('id="pkg-outro"'));
  assert.ok(landscape.indexHtml.includes("bgm-tech-01.wav"));

  const portraitSpec = {
    ...ragAgentDemoSpec,
    meta: { ...ragAgentDemoSpec.meta, width: 1080, height: 1920 },
  };
  const portrait = await buildArchStage(portraitSpec);
  assert.equal(portrait.width, 1080);
  assert.equal(portrait.height, 1920);
  assert.ok(portrait.indexHtml.includes('data-width="1080"'));
  assert.ok(portrait.indexHtml.includes('data-height="1920"'));
});

test("ArchStage Agent Loop: 首轮拓扑冲突时自动进入第 2 轮定向修复并成功", async () => {
  const tmpDir = mkdtempSync(join(tmpdir(), "arch-stage-agent-"));
  try {
    let callCount = 0;
    const broken = structuredClone(eventLoopDemoSpec);
    broken.nodes[1].col = broken.nodes[0].col;
    broken.nodes[1].row = broken.nodes[0].row;

    const result = await runArchStageAgent({
      topic: "JS 事件循环",
      outDir: tmpDir,
      maxRounds: 2,
      runCliVerify: false,
      llmCall: async () => {
        callCount += 1;
        return JSON.stringify(callCount === 1 ? broken : eventLoopDemoSpec);
      },
    });

    assert.equal(result.success, true);
    assert.equal(result.rounds.length, 2);
    assert.equal(result.rounds[0].status, "failed");
    assert.equal(result.rounds[1].status, "passed");
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});
