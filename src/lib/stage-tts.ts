import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { writeAlgoStageProject } from "@/algo-stage/agent";
import { buildAlgoStage } from "@/algo-stage/builder";
import { algoStageSpecSchema, type AlgoStageSpec } from "@/algo-stage/schema";
import { writeArchStageProject } from "@/arch-stage/agent";
import { buildArchStage } from "@/arch-stage/builder";
import { archStageSpecSchema, type ArchStageSpec } from "@/arch-stage/schema";
import { writeCodeStageProject } from "@/code-stage/agent";
import { buildCodeStage } from "@/code-stage/builder";
import { loadEnvValue } from "@/code-stage/env";
import { codeStageSpecSchema, type AudioSegment, type CodeStageSpec } from "@/code-stage/schema";
import { synthesizeVolcengineV3 } from "@/code-stage/volcengine-tts-v3";

function probeAudioDurationSeconds(filePath: string): number {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
    { encoding: "utf8" },
  ).trim();
  const sec = Number.parseFloat(out);
  if (!Number.isFinite(sec) || sec <= 0) {
    throw new Error(`ffprobe 无法读取音频时长: ${filePath}`);
  }
  return sec;
}

function getVolcConfig(speakerOverride?: string) {
  const apiKey = loadEnvValue("VOLC_TTS_API_KEY");
  if (!apiKey) {
    throw new Error("未找到 VOLC_TTS_API_KEY，请在 .env.local（或 POC worktree .env.local）中配置后再启用配音");
  }
  return {
    apiKey,
    resourceId: loadEnvValue("VOLC_TTS_RESOURCE_ID") || "seed-tts-2.0",
    speaker: speakerOverride || loadEnvValue("VOLC_TTS_SPEAKER") || "zh_female_vv_uranus_bigtts",
  };
}

export async function attachTtsToCodeStage(
  spec: CodeStageSpec,
  outDir: string,
  speakerOverride?: string,
): Promise<{ spec: CodeStageSpec; duration: number }> {
  const { apiKey, resourceId, speaker } = getVolcConfig(speakerOverride);
  mkdirSync(join(outDir, "assets/audio"), { recursive: true });

  const buffers = new Map<string, Buffer>();
  const segments: AudioSegment[] = [];
  const syncedSteps = [];
  let cursor = 0;

  for (const step of spec.steps) {
    const res = await synthesizeVolcengineV3({ apiKey, resourceId, speaker, text: step.narration });
    const relPath = `assets/audio/${step.id}.mp3`;
    const absPath = join(outDir, relPath);
    writeFileSync(absPath, res.audioBuffer);
    buffers.set(relPath, res.audioBuffer);

    const measured = probeAudioDurationSeconds(absPath);
    const stepDur = Number((measured + 0.6).toFixed(3));
    segments.push({
      id: step.id,
      file: relPath,
      start: Number(cursor.toFixed(3)),
      duration: Number(measured.toFixed(3)),
      words: res.words.map((w) => ({
        text: w.text,
        start: Number((cursor + w.start).toFixed(3)),
        end: Number((cursor + w.end).toFixed(3)),
      })),
    });
    syncedSteps.push({
      ...step,
      start: Number(cursor.toFixed(3)),
      duration: stepDur,
      segmentId: step.id,
    });
    cursor += stepDur;
  }

  const syncedSpec: CodeStageSpec = {
    ...spec,
    steps: syncedSteps,
    audio: { version: 1, duration: Number(cursor.toFixed(3)), segments },
  };
  const bundle = await buildCodeStage(syncedSpec);
  writeCodeStageProject(outDir, syncedSpec, bundle);
  mkdirSync(join(outDir, "assets/audio"), { recursive: true });
  for (const [relPath, buf] of buffers.entries()) {
    writeFileSync(join(outDir, relPath), buf);
  }
  return { spec: syncedSpec, duration: bundle.duration };
}

export async function attachTtsToAlgoStage(
  spec: AlgoStageSpec,
  outDir: string,
  speakerOverride?: string,
): Promise<{ spec: AlgoStageSpec; duration: number }> {
  const { apiKey, resourceId, speaker } = getVolcConfig(speakerOverride);
  mkdirSync(join(outDir, "assets/audio"), { recursive: true });

  const buffers = new Map<string, Buffer>();
  const segments: AudioSegment[] = [];
  const syncedFrames = [];
  let cursor = 0;

  for (const frame of spec.frames) {
    const res = await synthesizeVolcengineV3({ apiKey, resourceId, speaker, text: frame.narration });
    const relPath = `assets/audio/${frame.id}.mp3`;
    const absPath = join(outDir, relPath);
    writeFileSync(absPath, res.audioBuffer);
    buffers.set(relPath, res.audioBuffer);

    const measured = probeAudioDurationSeconds(absPath);
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
    syncedFrames.push({
      ...frame,
      start: Number(cursor.toFixed(3)),
      duration: frameDur,
    });
    cursor += frameDur;
  }

  const syncedSpec: AlgoStageSpec = {
    ...spec,
    frames: syncedFrames,
    audio: { version: 1, duration: Number(cursor.toFixed(3)), segments },
  };
  const bundle = await buildAlgoStage(syncedSpec);
  writeAlgoStageProject(outDir, syncedSpec, bundle);
  mkdirSync(join(outDir, "assets/audio"), { recursive: true });
  for (const [relPath, buf] of buffers.entries()) {
    writeFileSync(join(outDir, relPath), buf);
  }
  return { spec: syncedSpec, duration: bundle.duration };
}

export async function attachTtsToArchStage(
  spec: ArchStageSpec,
  outDir: string,
  speakerOverride?: string,
): Promise<{ spec: ArchStageSpec; duration: number }> {
  const { apiKey, resourceId, speaker } = getVolcConfig(speakerOverride);
  mkdirSync(join(outDir, "assets/audio"), { recursive: true });

  const buffers = new Map<string, Buffer>();
  const segments: AudioSegment[] = [];
  const syncedSteps = [];
  let cursor = 0;

  for (const step of spec.steps) {
    const res = await synthesizeVolcengineV3({ apiKey, resourceId, speaker, text: step.narration });
    const relPath = `assets/audio/${step.id}.mp3`;
    const absPath = join(outDir, relPath);
    writeFileSync(absPath, res.audioBuffer);
    buffers.set(relPath, res.audioBuffer);

    const measured = probeAudioDurationSeconds(absPath);
    const stepDur = Number((measured + 0.6).toFixed(3));
    segments.push({
      id: step.id,
      file: relPath,
      start: Number(cursor.toFixed(3)),
      duration: Number(measured.toFixed(3)),
      words: res.words.map((w) => ({
        text: w.text,
        start: Number((cursor + w.start).toFixed(3)),
        end: Number((cursor + w.end).toFixed(3)),
      })),
    });
    syncedSteps.push({
      ...step,
      start: Number(cursor.toFixed(3)),
      duration: stepDur,
    });
    cursor += stepDur;
  }

  const syncedSpec: ArchStageSpec = {
    ...spec,
    steps: syncedSteps,
    audio: { version: 1, duration: Number(cursor.toFixed(3)), segments },
  };
  const bundle = await buildArchStage(syncedSpec);
  writeArchStageProject(outDir, syncedSpec, bundle);
  mkdirSync(join(outDir, "assets/audio"), { recursive: true });
  for (const [relPath, buf] of buffers.entries()) {
    writeFileSync(join(outDir, relPath), buf);
  }
  return { spec: syncedSpec, duration: bundle.duration };
}

export async function synthesizeTtsForProjectDir(
  projectDir: string,
  speakerOverride?: string,
): Promise<{ engine: "code-stage" | "algo-stage" | "arch-stage"; duration: number }> {
  const raw = JSON.parse(readFileSync(join(projectDir, "spec.json"), "utf8")) as Record<string, unknown>;
  if (Array.isArray(raw.frames)) {
    const parsed = algoStageSpecSchema.parse(raw);
    const res = await attachTtsToAlgoStage(parsed, projectDir, speakerOverride);
    return { engine: "algo-stage", duration: res.duration };
  }
  if (raw.engine === "arch-stage" || Array.isArray(raw.nodes)) {
    const parsed = archStageSpecSchema.parse(raw);
    const res = await attachTtsToArchStage(parsed, projectDir, speakerOverride);
    return { engine: "arch-stage", duration: res.duration };
  }
  const parsed = codeStageSpecSchema.parse(raw);
  const res = await attachTtsToCodeStage(parsed, projectDir, speakerOverride);
  return { engine: "code-stage", duration: res.duration };
}
