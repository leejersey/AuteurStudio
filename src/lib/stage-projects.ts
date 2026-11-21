import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

export interface StageProjectSummary {
  slug: string;
  engine: "code-stage" | "algo-stage";
  id: string;
  title: string;
  subtitle?: string;
  duration: number;
  width: number;
  height: number;
  itemCount: number;
  hasAudio: boolean;
  previewUrl: string;
  timelineItems: Array<{
    id: string;
    label: string;
    start: number;
    duration: number;
  }>;
}

function readStageProject(rootDir: string, slug: string): StageProjectSummary | null {
  const dir = join(rootDir, slug);
  const indexPath = join(dir, "index.html");
  const specPath = join(dir, "spec.json");
  if (!existsSync(indexPath) || !existsSync(specPath)) return null;

  try {
    const spec = JSON.parse(readFileSync(specPath, "utf8")) as Record<string, unknown>;
    const meta = (spec.meta ?? {}) as Record<string, unknown>;
    const isAlgo = Array.isArray(spec.frames);
    const items = (isAlgo ? spec.frames : spec.steps) as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(items) || items.length === 0) return null;

    const last = items[items.length - 1];
    const duration = Number(last.start ?? 0) + Number(last.duration ?? 0);
    const audio = spec.audio as { segments?: unknown[] } | undefined;
    const hasAudio = Boolean(audio && Array.isArray(audio.segments) && audio.segments.length > 0);

    return {
      slug,
      engine: isAlgo ? "algo-stage" : "code-stage",
      id: String(meta.id ?? slug),
      title: String(meta.title ?? slug),
      subtitle: meta.algorithm ? String(meta.algorithm) : meta.language ? String(meta.language).toUpperCase() : undefined,
      duration: Number(duration.toFixed(2)),
      width: Number(meta.width ?? 1920),
      height: Number(meta.height ?? 1080),
      itemCount: items.length,
      hasAudio,
      previewUrl: `/api/stage-preview/${slug}/index.html`,
      timelineItems: items.map((it, idx) => ({
        id: String(it.id ?? `item-${idx}`),
        label: String(it.badge || it.headline || it.note || `Step ${idx + 1}`),
        start: Number(it.start ?? 0),
        duration: Number(it.duration ?? 0),
      })),
    };
  } catch {
    return null;
  }
}

export function listStageProjects(cwd = process.cwd()): StageProjectSummary[] {
  const rootDir = resolve(cwd, "hyperframes");
  const projects: StageProjectSummary[] = [];

  if (!existsSync(rootDir)) return projects;

  const builtInSlugs = ["code-stage-demo", "algo-stage-binary-search", "algo-stage-reverse-linked-list"];
  for (const slug of builtInSlugs) {
    const p = readStageProject(rootDir, slug);
    if (p) projects.push(p);
  }

  const genDir = join(rootDir, "generated");
  if (existsSync(genDir) && statSync(genDir).isDirectory()) {
    const entries = readdirSync(genDir).sort().reverse();
    for (const entry of entries) {
      const p = readStageProject(rootDir, `generated/${entry}`);
      if (p) projects.push(p);
    }
  }

  return projects;
}
