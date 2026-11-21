import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { runAlgoStageAgentLoop, writeAlgoStageProject } from "../../src/algo-stage/agent";
import { buildAlgoStage } from "../../src/algo-stage/builder";
import type { AlgoStageSpec } from "../../src/algo-stage/schema";
import { loadEnvValue } from "../../src/code-stage/env";
import type { AudioSegment } from "../../src/code-stage/schema";
import { synthesizeVolcengineV3 } from "../../src/code-stage/volcengine-tts-v3";

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let structureHint: "array" | "linked-list" | "tree" | "matrix" | "stack-queue" | undefined;
  let sampleInput: string | undefined;
  let outDir: string | undefined;
  let maxRounds = 3;
  let withTts = false;
  let runInspect = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--structure" && argv[i + 1]) {
      structureHint = argv[++i] as typeof structureHint;
    } else if (arg === "--input" && argv[i + 1]) {
      sampleInput = argv[++i];
    } else if ((arg === "--out" || arg === "-o") && argv[i + 1]) {
      outDir = argv[++i];
    } else if (arg === "--rounds" && argv[i + 1]) {
      maxRounds = Number.parseInt(argv[++i], 10) || 3;
    } else if (arg === "--with-tts") {
      withTts = true;
    } else if (arg === "--inspect") {
      runInspect = true;
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }

  const topic = positional.join(" ").trim();
  if (!topic) {
    throw new Error(
      '请提供算法主题，例如：npm run algo-stage:gen -- "滑动窗口求最长无重复子串" --structure array [--with-tts]',
    );
  }
  return { topic, structureHint, sampleInput, outDir, maxRounds, withTts, runInspect };
}

function slugify(input: string): string {
  const ascii = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii.length >= 3 ? ascii.slice(0, 32) : `algo-${Date.now()}`;
}

function probeDuration(filePath: string): number {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
    { encoding: "utf8" },
  ).trim();
  const sec = Number.parseFloat(out);
  if (!Number.isFinite(sec) || sec <= 0) throw new Error(`ffprobe 无法读取音频时长: ${filePath}`);
  return sec;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetDir = resolve(process.cwd(), args.outDir || join("hyperframes/generated", slugify(args.topic)));

  const result = await runAlgoStageAgentLoop({
    request: {
      topic: args.topic,
      structureHint: args.structureHint,
      sampleInput: args.sampleInput,
    },
    outDir: targetDir,
    maxRounds: args.maxRounds,
    runHyperFramesLint: true,
    runHyperFramesInspect: args.runInspect,
    onProgress: ({ round, step, detail }) => {
      console.log(`[AlgoAgent Round ${round}] (${step}) ${detail ?? ""}`);
    },
  });

  if (args.withTts) {
    const apiKey = loadEnvValue("VOLC_TTS_API_KEY");
    if (!apiKey) throw new Error("未找到 VOLC_TTS_API_KEY，无法启用 --with-tts");
    const resourceId = loadEnvValue("VOLC_TTS_RESOURCE_ID") || "seed-tts-2.0";
    const speaker = loadEnvValue("VOLC_TTS_SPEAKER") || "zh_female_vv_uranus_bigtts";

    mkdirSync(join(targetDir, "assets/audio"), { recursive: true });
    const buffers = new Map<string, Buffer>();
    const segments: AudioSegment[] = [];
    const syncedFrames = [];
    let cursor = 0;

    for (const frame of result.spec.frames) {
      console.log(`[TTS V3] 合成 ${frame.id}...`);
      const res = await synthesizeVolcengineV3({ apiKey, resourceId, speaker, text: frame.narration });
      const relPath = `assets/audio/${frame.id}.mp3`;
      const absPath = join(targetDir, relPath);
      writeFileSync(absPath, res.audioBuffer);
      buffers.set(relPath, res.audioBuffer);

      const measured = probeDuration(absPath);
      const frameDur = Number((measured + 0.55).toFixed(3));
      segments.push({
        id: frame.id,
        file: relPath,
        start: Number(cursor.toFixed(3)),
        duration: Number(measured.toFixed(3)),
        words: res.words.map((w) => ({
          text: w.text,
          start: Number((cursor + w.start).toFixed(3)),
          end: Number((cursor + w.end).toFixed(3)),
        })),
      });
      syncedFrames.push({ ...frame, start: Number(cursor.toFixed(3)), duration: frameDur });
      cursor += frameDur;
    }

    const syncedSpec: AlgoStageSpec = {
      ...result.spec,
      frames: syncedFrames,
      audio: { version: 1, duration: Number(cursor.toFixed(3)), segments },
    };
    const bundle = await buildAlgoStage(syncedSpec);
    writeAlgoStageProject(targetDir, syncedSpec, bundle);
    mkdirSync(join(targetDir, "assets/audio"), { recursive: true });
    for (const [relPath, buf] of buffers.entries()) {
      writeFileSync(join(targetDir, relPath), buf);
    }
    console.log(JSON.stringify({ outDir: targetDir, withTts: true, rounds: result.rounds, frames: syncedFrames.length, duration: bundle.duration }, null, 2));
    return;
  }

  console.log(
    JSON.stringify(
      {
        outDir: result.outDir,
        withTts: false,
        rounds: result.rounds,
        frames: result.spec.frames.length,
        duration: result.bundle.duration,
        trace: result.trace,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
