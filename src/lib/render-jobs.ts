import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

export type RenderJobStatus = "queued" | "running" | "completed" | "failed";

export interface RenderJobRecord {
  id: string;
  slug: string;
  title: string;
  status: RenderJobStatus;
  progress: number;
  outputUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  durationMs?: number;
}

const JOBS_DIR = resolve(process.cwd(), "hyperframes/.jobs");
const JOBS_FILE = join(JOBS_DIR, "render-jobs.json");

function readJobsFile(): RenderJobRecord[] {
  if (!existsSync(JOBS_FILE)) return [];
  try {
    const parsed = JSON.parse(readFileSync(JOBS_FILE, "utf8"));
    return Array.isArray(parsed) ? (parsed as RenderJobRecord[]) : [];
  } catch {
    return [];
  }
}

function writeJobsFile(jobs: RenderJobRecord[]): void {
  mkdirSync(JOBS_DIR, { recursive: true });
  const tmp = `${JOBS_FILE}.${randomUUID()}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(jobs, null, 2)}\n`, "utf8");
  renameSync(tmp, JOBS_FILE);
}

function upsertJob(job: RenderJobRecord): void {
  const jobs = readJobsFile();
  const idx = jobs.findIndex((j) => j.id === job.id);
  if (idx >= 0) {
    jobs[idx] = job;
  } else {
    jobs.unshift(job);
  }
  // 最多保留最近 50 条渲染历史
  writeJobsFile(jobs.slice(0, 50));
}

export function listRenderJobs(): RenderJobRecord[] {
  return readJobsFile();
}

export function getRenderJob(id: string): RenderJobRecord | null {
  return readJobsFile().find((j) => j.id === id) ?? null;
}

export function deleteRenderJob(id: string): boolean {
  const jobs = readJobsFile();
  const filtered = jobs.filter((j) => j.id !== id);
  if (filtered.length === jobs.length) return false;
  writeJobsFile(filtered);
  return true;
}

function readProjectTitle(projectDir: string, fallback: string): string {
  try {
    const spec = JSON.parse(readFileSync(join(projectDir, "spec.json"), "utf8")) as {
      meta?: { title?: string };
    };
    return spec.meta?.title || fallback;
  } catch {
    return fallback;
  }
}

/**
 * 提交异步 HyperFrames MP4 渲染任务：
 * - 立即持久化 queued 任务并返回，避免 HTTP 超时；
 * - 后台 spawn `hyperframes render` 实时解析进度写入磁盘。
 */
export function enqueueRenderJob(slug: string): RenderJobRecord {
  const rootDir = resolve(process.cwd(), "hyperframes");
  const projectDir = resolve(rootDir, slug);
  const rel = relative(rootDir, projectDir);
  if (rel.startsWith("..") || !existsSync(join(projectDir, "index.html"))) {
    throw new Error("目标 HyperFrames 视频工程不存在");
  }

  const hfBin = resolve(process.cwd(), "node_modules/.bin/hyperframes");
  if (!existsSync(hfBin)) {
    throw new Error("未找到本地 hyperframes CLI");
  }

  const now = new Date().toISOString();
  const job: RenderJobRecord = {
    id: randomUUID(),
    slug,
    title: readProjectTitle(projectDir, slug),
    status: "queued",
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };
  upsertJob(job);

  const rendersDir = resolve(process.cwd(), "public/renders");
  mkdirSync(rendersDir, { recursive: true });
  const safeName = slug.replace(/[^a-zA-Z0-9-_]/g, "_");
  const fileName = `${safeName}_${Date.now()}.mp4`;
  const outputPath = join(rendersDir, fileName);
  const startedAt = Date.now();

  const update = (patch: Partial<RenderJobRecord>) => {
    const current = getRenderJob(job.id) ?? job;
    upsertJob({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  update({ status: "running", progress: 5 });

  const child = spawn(hfBin, ["render", projectDir, "-o", outputPath], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderrTail = "";
  const parseProgress = (chunk: Buffer) => {
    const text = chunk.toString("utf8");
    const pctMatch = text.match(/(\d{1,3})\s*%/);
    if (pctMatch) {
      const pct = Math.max(5, Math.min(99, Number.parseInt(pctMatch[1], 10)));
      update({ progress: pct });
    }
  };

  child.stdout?.on("data", parseProgress);
  child.stderr?.on("data", (chunk: Buffer) => {
    stderrTail = (stderrTail + chunk.toString("utf8")).slice(-1000);
    parseProgress(chunk);
  });

  child.on("error", (err) => {
    update({
      status: "failed",
      error: err.message,
      durationMs: Date.now() - startedAt,
    });
  });

  child.on("close", (code) => {
    if (code === 0 && existsSync(outputPath)) {
      update({
        status: "completed",
        progress: 100,
        outputUrl: `/renders/${fileName}`,
        durationMs: Date.now() - startedAt,
      });
    } else {
      update({
        status: "failed",
        error: stderrTail.trim() || `hyperframes render 退出码 ${code}`,
        durationMs: Date.now() - startedAt,
      });
    }
  });

  return getRenderJob(job.id) ?? job;
}
