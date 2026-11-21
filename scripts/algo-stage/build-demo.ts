import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { buildAlgoStage } from "../../src/algo-stage/builder";
import { createBinarySearchSpec } from "../../src/algo-stage/demos/binary-search";
import { createReverseLinkedListSpec } from "../../src/algo-stage/demos/reverse-linked-list";

const root = process.cwd();
const demoFlagIdx = process.argv.indexOf("--demo");
const demoName = demoFlagIdx >= 0 && process.argv[demoFlagIdx + 1] ? process.argv[demoFlagIdx + 1] : "binary-search";

async function main() {
  const spec =
    demoName === "reverse-linked-list" ? createReverseLinkedListSpec() : createBinarySearchSpec();
  const outDir = resolve(root, `hyperframes/algo-stage-${demoName}`);

  const bundle = await buildAlgoStage(spec);

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, "assets/vendor"), { recursive: true });
  mkdirSync(join(outDir, "assets/fonts"), { recursive: true });

  for (const [relPath, content] of Object.entries(bundle.files)) {
    const abs = join(outDir, relPath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
  }
  writeFileSync(join(outDir, "spec.json"), `${JSON.stringify(spec, null, 2)}\n`, "utf8");

  const gsapSrc = [
    join(root, "node_modules/gsap/dist/gsap.min.js"),
    join(root, ".worktrees/hyperframes-knowledge-poc/node_modules/gsap/dist/gsap.min.js"),
  ].find((p) => existsSync(p));
  if (!gsapSrc) throw new Error("未找到 gsap.min.js");
  copyFileSync(gsapSrc, join(outDir, "assets/vendor/gsap.min.js"));

  const fontSrc = join(root, "node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff2");
  if (!existsSync(fontSrc)) throw new Error("未找到 noto-sans-sc 字体文件");
  copyFileSync(fontSrc, join(outDir, "assets/fonts/noto-sans-sc.woff2"));

  console.log(
    JSON.stringify(
      {
        demo: demoName,
        outDir,
        frames: spec.frames.length,
        duration: bundle.duration,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
