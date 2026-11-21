import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAlgoStageAgentLoop } from "@/algo-stage/agent";
import { attachTtsToAlgoStage } from "@/lib/stage-tts";

const generateAlgoRequestSchema = z.object({
  topic: z.string().trim().min(1, "请提供算法或数据结构主题"),
  structureHint: z.enum(["array", "linked-list", "tree", "matrix", "stack-queue"]).optional(),
  sampleInput: z.string().optional(),
  referenceCode: z.string().optional(),
  shikiTheme: z.enum(["dracula", "tokyo-night", "github-dark", "catppuccin-mocha", "one-dark-pro"]).optional(),
  maxRounds: z.number().int().min(1).max(5).default(3),
  runInspect: z.boolean().default(false),
  withTts: z.boolean().default(false),
  speaker: z.string().trim().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = generateAlgoRequestSchema.parse(body);

    const slug = `generated/algo-${Date.now()}`;
    const outDir = join(process.cwd(), "hyperframes", slug);
    const result = await runAlgoStageAgentLoop({
      request: {
        topic: input.topic,
        structureHint: input.structureHint,
        sampleInput: input.sampleInput,
        referenceCode: input.referenceCode,
        shikiTheme: input.shikiTheme,
      },
      outDir,
      maxRounds: input.maxRounds,
      runHyperFramesLint: true,
      runHyperFramesInspect: input.runInspect,
    });

    let finalSpec = result.spec;
    let finalDuration = result.bundle.duration;

    if (input.withTts) {
      const ttsRes = await attachTtsToAlgoStage(result.spec, result.outDir, input.speaker);
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
      frames: finalSpec.frames.length,
      rounds: result.rounds,
      trace: result.trace,
      spec: finalSpec,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "请求参数校验失败", details: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AlgoStage 生成失败" },
      { status: 500 },
    );
  }
}
