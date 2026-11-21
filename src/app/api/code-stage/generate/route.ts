import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runCodeStageAgentLoop } from "@/code-stage/agent";
import { attachTtsToCodeStage } from "@/lib/stage-tts";

const generateRequestSchema = z.object({
  topic: z.string().trim().min(1, "请提供编程或语法主题"),
  language: z.string().trim().min(1).optional(),
  shikiTheme: z.enum(["dracula", "tokyo-night", "github-dark", "catppuccin-mocha", "one-dark-pro"]).optional(),
  referenceCode: z.string().optional(),
  targetSteps: z.number().int().min(2).max(6).optional(),
  maxRounds: z.number().int().min(1).max(5).default(3),
  runInspect: z.boolean().default(false),
  withTts: z.boolean().default(false),
  speaker: z.string().trim().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = generateRequestSchema.parse(body);

    const slug = `generated/cs-${Date.now()}`;
    const outDir = join(process.cwd(), "hyperframes", slug);

    const result = await runCodeStageAgentLoop({
      request: {
        topic: input.topic,
        language: input.language,
        shikiTheme: input.shikiTheme,
        referenceCode: input.referenceCode,
        targetSteps: input.targetSteps,
      },
      outDir,
      maxRounds: input.maxRounds,
      runHyperFramesLint: true,
      runHyperFramesInspect: input.runInspect,
    });

    let finalSpec = result.spec;
    let finalDuration = result.bundle.duration;

    if (input.withTts) {
      const ttsRes = await attachTtsToCodeStage(result.spec, result.outDir, input.speaker);
      finalSpec = ttsRes.spec;
      finalDuration = ttsRes.duration;
    }

    return NextResponse.json({
      id: finalSpec.meta.id,
      slug,
      previewUrl: `/api/stage-preview/${slug}/index.html`,
      outDir: result.outDir,
      duration: finalDuration,
      hasAudio: input.withTts,
      rounds: result.rounds,
      trace: result.trace,
      spec: finalSpec,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "请求参数校验失败", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "CodeStage 生成失败" },
      { status: 500 },
    );
  }
}
