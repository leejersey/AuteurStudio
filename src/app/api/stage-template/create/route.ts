import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { AlgoStageSpec } from "@/algo-stage/schema";
import type { ArchStageSpec } from "@/arch-stage/schema";
import type { CodeStageSpec } from "@/code-stage/schema";
import { compileTemplateToDir, STAGE_TEMPLATES, type TemplateId } from "@/lib/stage-templates";
import { attachTtsToAlgoStage, attachTtsToArchStage, attachTtsToCodeStage } from "@/lib/stage-tts";

export const dynamic = "force-dynamic";

const createReqSchema = z.object({
  templateId: z.enum([
    "code-3-step",
    "code-before-after",
    "algo-binary-search",
    "algo-bubble-sort",
    "algo-reverse-list",
    "algo-dp-grid",
    "arch-event-loop",
    "arch-rag-agent",
  ]),
  params: z.record(z.string(), z.string()).default({}),
  shikiTheme: z.enum(["dracula", "tokyo-night", "github-dark", "catppuccin-mocha", "one-dark-pro"]).default("dracula"),
  withTts: z.boolean().default(false),
  speaker: z.string().trim().min(1).optional(),
  enablePackaging: z.boolean().default(true),
});

export async function GET() {
  return NextResponse.json({ templates: STAGE_TEMPLATES });
}

export async function POST(req: NextRequest) {
  try {
    const input = createReqSchema.parse(await req.json());
    const slug = `generated/tpl-${input.templateId}-${Date.now()}`;
    const outDir = join(process.cwd(), "hyperframes", slug);

    const compiled = await compileTemplateToDir(
      input.templateId as TemplateId,
      input.params,
      input.shikiTheme,
      outDir,
      input.enablePackaging,
    );

    let duration = compiled.duration;
    if (input.withTts) {
      if (compiled.engine === "code-stage") {
        const res = await attachTtsToCodeStage(compiled.spec as CodeStageSpec, outDir, input.speaker);
        duration = res.duration;
      } else if (compiled.engine === "arch-stage") {
        const res = await attachTtsToArchStage(compiled.spec as ArchStageSpec, outDir, input.speaker);
        duration = res.duration;
      } else {
        const res = await attachTtsToAlgoStage(compiled.spec as AlgoStageSpec, outDir, input.speaker);
        duration = res.duration;
      }
    }

    return NextResponse.json({
      slug,
      engine: compiled.engine,
      duration,
      hasAudio: input.withTts || input.enablePackaging,
      previewUrl: `/api/stage-preview/${slug}/index.html`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "模板参数校验失败", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "模板生成失败" },
      { status: 500 },
    );
  }
}
