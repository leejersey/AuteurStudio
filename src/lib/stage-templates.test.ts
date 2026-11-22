import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { compileTemplateToDir, STAGE_TEMPLATES } from "./stage-templates";

test("全部 6 套参数化模板无需 LLM 即可毫秒级编译通过", async () => {
  for (const tpl of STAGE_TEMPLATES) {
    const outDir = join(tmpdir(), `stage-tpl-test-${tpl.id}-${Date.now()}`);
    const defaults = Object.fromEntries(tpl.fields.map((f) => [f.key, f.defaultValue]));
    try {
      const res = await compileTemplateToDir(tpl.id, defaults, "dracula", outDir, true);
      assert.equal(res.engine, tpl.engine);
      assert.ok(res.duration > 5);
      assert.ok(existsSync(join(outDir, "index.html")));
      assert.ok(existsSync(join(outDir, "spec.json")));
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  }
});
