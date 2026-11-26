import { resolve } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runArchStageAgent } from "@/arch-stage/agent";
import { stageThemeSchema } from "@/arch-stage/schema";
import { attachTtsToArchStage } from "@/lib/stage-tts";

const requestSchema = z.object({
  topic: z.string().trim().min(2, "请输入系统架构或原理主题").max(200),
  domain: z.string().trim().max(28).optional(),
  theme: stageThemeSchema.default("dracula"),
  targetSteps: z.number().int().min(2).max(6).optional(),
  referenceNotes: z.string().max(6000).optional(),
  maxRounds: z.number().int().min(1).max(4).default(3),
  withTts: z.boolean().default(false),
  speaker: z.string().trim().optional(),
});

function slugifyTopic(topic: string): string {
  const ascii = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);
  return `arch-${Date.now()}-${ascii || "diagram"}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = requestSchema.parse(await req.json());
    const slug = `generated/${slugifyTopic(body.topic)}`;
    const outDir = resolve(process.cwd(), "hyperframes", slug);

    const result = await runArchStageAgent({
      topic: body.topic,
      outDir,
      domain: body.domain,
      theme: body.theme,
      targetSteps: body.targetSteps,
      referenceNotes: body.referenceNotes,
      maxRounds: body.maxRounds,
      runCliVerify: true,
    });

    if (!result.success || !result.spec || !result.bundle) {
      return NextResponse.json(
        {
          error: "ArchStage Agent Loop 未能通过校验门禁",
          issues: result.finalIssues,
          rounds: result.rounds,
        },
        { status: 422 },
      );
    }

    let finalDuration = result.bundle.duration;
    let ttsWarning: string | undefined;
    if (body.withTts) {
      try {
        const ttsRes = await attachTtsToArchStage(result.spec, outDir, body.speaker);
        finalDuration = ttsRes.duration;
      } catch (err) {
        ttsWarning = err instanceof Error ? err.message : "火山 V3 配音失败，已保留无声版本";
      }
    }

    return NextResponse.json({
      slug,
      engine: "arch-stage",
      duration: finalDuration,
      previewUrl: `/api/stage-preview/${slug}/index.html`,
      rounds: result.rounds,
      ttsWarning,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "参数错误" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ArchStage 生成失败" },
      { status: 500 },
    );
  }
}
