import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeAlgoStageProject } from "@/algo-stage/agent";
import { buildAlgoStage } from "@/algo-stage/builder";
import { algoStageSpecSchema } from "@/algo-stage/schema";
import { writeArchStageProject } from "@/arch-stage/agent";
import { buildArchStage } from "@/arch-stage/builder";
import { archStageSpecSchema } from "@/arch-stage/schema";
import { writeCodeStageProject } from "@/code-stage/agent";
import { buildCodeStage } from "@/code-stage/builder";
import { codeStageSpecSchema } from "@/code-stage/schema";

const putSchema = z.object({
  slug: z.string().trim().min(1),
  spec: z.record(z.string(), z.unknown()),
});

function resolveSafeProjectDir(slug: string): string | null {
  const rootDir = resolve(process.cwd(), "hyperframes");
  const projectDir = resolve(rootDir, slug);
  const rel = relative(rootDir, projectDir);
  if (rel.startsWith("..") || !existsSync(join(projectDir, "spec.json"))) {
    return null;
  }
  return projectDir;
}

function preserveExistingAudio(projectDir: string): Map<string, Buffer> {
  const saved = new Map<string, Buffer>();
  const audioDir = join(projectDir, "assets/audio");
  if (!existsSync(audioDir)) return saved;
  for (const name of readdirSync(audioDir)) {
    saved.set(name, readFileSync(join(audioDir, name)));
  }
  return saved;
}

function restorePreservedAudio(projectDir: string, saved: Map<string, Buffer>): void {
  if (saved.size === 0) return;
  const audioDir = join(projectDir, "assets/audio");
  mkdirSync(audioDir, { recursive: true });
  for (const [name, buf] of saved.entries()) {
    writeFileSync(join(audioDir, name), buf);
  }
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "缺少 slug 参数" }, { status: 400 });
  }
  const projectDir = resolveSafeProjectDir(slug);
  if (!projectDir) {
    return NextResponse.json({ error: "目标工程不存在" }, { status: 404 });
  }
  const spec = JSON.parse(readFileSync(join(projectDir, "spec.json"), "utf8"));
  const engine = Array.isArray(spec.frames)
    ? "algo-stage"
    : spec.engine === "arch-stage" || Array.isArray(spec.nodes)
      ? "arch-stage"
      : "code-stage";
  return NextResponse.json({ slug, engine, spec });
}

export async function PUT(req: NextRequest) {
  try {
    const { slug, spec: rawSpec } = putSchema.parse(await req.json());
    const projectDir = resolveSafeProjectDir(slug);
    if (!projectDir) {
      return NextResponse.json({ error: "目标工程不存在" }, { status: 404 });
    }

    // 保留已有音频文件，实现改文案/改高亮/切 9:16 画幅时毫秒级无损重编译
    const preservedAudio = preserveExistingAudio(projectDir);

    if (Array.isArray(rawSpec.frames)) {
      const parsed = algoStageSpecSchema.parse(rawSpec);
      const bundle = await buildAlgoStage(parsed);
      writeAlgoStageProject(projectDir, parsed, bundle);
      restorePreservedAudio(projectDir, preservedAudio);
      return NextResponse.json({
        slug,
        engine: "algo-stage",
        duration: bundle.duration,
        width: bundle.width,
        height: bundle.height,
        spec: parsed,
      });
    }

    if (rawSpec.engine === "arch-stage" || Array.isArray(rawSpec.nodes)) {
      const parsed = archStageSpecSchema.parse(rawSpec);
      const bundle = await buildArchStage(parsed);
      writeArchStageProject(projectDir, parsed, bundle);
      restorePreservedAudio(projectDir, preservedAudio);
      return NextResponse.json({
        slug,
        engine: "arch-stage",
        duration: bundle.duration,
        width: bundle.width,
        height: bundle.height,
        spec: parsed,
      });
    }

    const parsed = codeStageSpecSchema.parse(rawSpec);
    const bundle = await buildCodeStage(parsed);
    writeCodeStageProject(projectDir, parsed, bundle);
    restorePreservedAudio(projectDir, preservedAudio);
    return NextResponse.json({
      slug,
      engine: "code-stage",
      duration: bundle.duration,
      width: bundle.width,
      height: bundle.height,
      spec: parsed,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Spec 校验失败", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "重编译失败" },
      { status: 500 },
    );
  }
}
