import assert from "node:assert/strict";
import test from "node:test";
import { buildCodeStageSpecFromDiff, parseUnifiedDiff } from "./git-diff";

const SAMPLE_DIFF = `diff --git a/src/utils/cache.ts b/src/utils/cache.ts
index 1234567..89abcdef 100644
--- a/src/utils/cache.ts
+++ b/src/utils/cache.ts
@@ -1,6 +1,8 @@
 export function getCached(map: Map<string, number>, key: string) {
-  if (map.has(key)) {
-    return map.get(key);
+  const hit = map.get(key);
+  if (hit !== undefined) {
+    return hit;
   }
-  return null;
+  return -1;
 }`;

test("Git Diff 解析器: 准确抽取 Before/After 代码与增删统计", () => {
  const files = parseUnifiedDiff(SAMPLE_DIFF);
  assert.equal(files.length, 1);
  assert.equal(files[0].filename, "src/utils/cache.ts");
  assert.equal(files[0].language, "typescript");
  assert.equal(files[0].addedCount, 4);
  assert.equal(files[0].removedCount, 3);
  assert.ok(files[0].beforeCode.includes("map.has(key)"));
  assert.ok(files[0].afterCode.includes("const hit = map.get(key);"));
});

test("Git Diff 转 CodeStageSpec: 生成合法 3 步演进脚本", () => {
  const spec = buildCodeStageSpecFromDiff({
    diffText: SAMPLE_DIFF,
    enablePackaging: true,
  });
  assert.equal(spec.steps.length, 3);
  assert.equal(spec.meta.language, "typescript");
  assert.ok(spec.meta.title.includes("cache.ts"));
  assert.equal(spec.packaging?.enableIntro, true);
  assert.equal(spec.packaging?.enableOutro, true);
});
