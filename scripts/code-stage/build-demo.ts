import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { buildCodeStage } from "../../src/code-stage/builder";
import { pythonDecoratorDemoSpec } from "../../src/code-stage/demos/python-decorator";
import type { AudioSegment, CodeStageSpec } from "../../src/code-stage/schema";
import { synthesizeVolcengineV3 } from "../../src/code-stage/volcengine-tts-v3";

const root = process.cwd();
const outDir = resolve(root, "hyperframes/code-stage-demo");
const withTts = process.argv.includes("--with-tts");

function loadEnvValue(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  const candidates = [
    join(root, ".env.local"),
    join(root, ".worktrees/hyperframes-knowledge-poc/.env.local"),
  ];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && match[1] === key) {
        return match[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  return undefined;
}

function probeAudioDurationSeconds(filePath: string): number {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
    { encoding: "utf8" },
  ).trim();
  const seconds = Number.parseFloat(out);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(`无法读取音频时长: ${filePath}`);
  }
  return seconds;
}

async function attachRealTts(baseSpec: CodeStageSpec, targetDir: string): Promise<CodeStageSpec> {
  const apiKey = loadEnvValue("VOLC_TTS_API_KEY");
  if (!apiKey) {
    throw new Error("未找到 VOLC_TTS_API_KEY，无法使用 --with-tts 模式");
  }
  const resourceId = loadEnvValue("VOLC_TTS_RESOURCE_ID") || "seed-tts-2.0";
  const speaker = loadEnvValue("VOLC_TTS_SPEAKER") || "zh_female_vv_uranus_bigtts";

  const audioDir = join(targetDir, "assets/audio");
  mkdirSync(audioDir, { recursive: true });

  const segments: AudioSegment[] = [];
  const updatedSteps = [];
  let cursor = 0;
  const paddingSec = 0.65;

  for (const step of baseSpec.steps) {
    console.log(`[CodeStage TTS] 正在合成 ${step.id}...`);
    const result = await synthesizeVolcengineV3({
      apiKey,
      resourceId,
      speaker,
      text: step.narration,
    });
    const relPath = `assets/audio/${step.id}.mp3`;
    const absPath = join(targetDir, relPath);
    writeFileSync(absPath, result.audioBuffer);

    const measuredDur = probeAudioDurationSeconds(absPath);
    const stepDur = Number((measuredDur + paddingSec).toFixed(3));

    segments.push({
      id: step.id,
      file: relPath,
      start: Number(cursor.toFixed(3)),
      duration: Number(measuredDur.toFixed(3)),
      words: result.words.map((w) => ({
        text: w.text,
        start: Number((cursor + w.start).toFixed(3)),
        end: Number((cursor + w.end).toFixed(3)),
      })),
    });

    updatedSteps.push({
      ...step,
      start: Number(cursor.toFixed(3)),
      duration: stepDur,
      segmentId: step.id,
    });

    cursor += stepDur;
  }

  return {
    ...baseSpec,
    steps: updatedSteps,
    audio: {
      version: 1,
      duration: Number(cursor.toFixed(3)),
      segments,
    },
  };
}

async function main() {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, "assets/vendor"), { recursive: true });
  mkdirSync(join(outDir, "assets/fonts"), { recursive: true });

  const spec = withTts ? await attachRealTts(pythonDecoratorDemoSpec, outDir) : pythonDecoratorDemoSpec;
  const bundle = await buildCodeStage(spec);

  for (const [relPath, content] of Object.entries(bundle.files)) {
    const abs = join(outDir, relPath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
  }

  writeFileSync(join(outDir, "spec.json"), `${JSON.stringify(spec, null, 2)}\n`, "utf8");

  // 冻结本地 GSAP 与中文字体（离线确定性渲染）
  const gsapCandidates = [
    join(root, "node_modules/gsap/dist/gsap.min.js"),
    join(root, ".worktrees/hyperframes-knowledge-poc/node_modules/gsap/dist/gsap.min.js"),
  ];
  const gsapSrc = gsapCandidates.find((p) => existsSync(p));
  if (!gsapSrc) throw new Error("未找到 gsap.min.js");
  copyFileSync(gsapSrc, join(outDir, "assets/vendor/gsap.min.js"));

  const fontSrc = join(root, "node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-700-normal.woff2");
  if (!existsSync(fontSrc)) throw new Error("未找到 noto-sans-sc 字体文件");
  copyFileSync(fontSrc, join(outDir, "assets/fonts/noto-sans-sc.woff2"));

  console.log(
    JSON.stringify(
      {
        outDir,
        withTts,
        duration: bundle.duration,
        steps: spec.steps.length,
        files: Object.keys(bundle.files),
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
