import { resolve } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stageThemeSchema } from "@/arch-stage/schema";
import { writeCodeStageProject } from "@/code-stage/agent";
import { buildCodeStage } from "@/code-stage/builder";
import { buildCodeStageSpecFromDiff, fetchGithubPrDiff } from "@/code-stage/git-diff";
import { attachTtsToCodeStage } from "@/lib/stage-tts";

const requestSchema = z.object({
  diffText: z.string().optional(),
  prUrl: z.string().optional(),
  title: z.string().trim().max(120).optional(),
  theme: stageThemeSchema.default("dracula"),
  enablePackaging: z.boolean().default(true),
  withTts: z.boolean().default(false),
  speaker: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = requestSchema.parse(await req.json());
    let diffText = body.diffText?.trim() ?? "";
    let title = body.title?.trim() ?? "";

    if (!diffText && body.prUrl?.trim()) {
      const fetched = await fetchGithubPrDiff(body.prUrl.trim());
      diffText = fetched.diffText;
      if (!title) title = fetched.suggestedTitle;
    }

    if (!diffText) {
      return NextResponse.json(
        { error: "请粘贴 git diff 文本，或输入公开的 GitHub PR 链接" },
        { status: 400 },
      );
    }

    const spec = buildCodeStageSpecFromDiff({
      diffText,
      title: title || undefined,
      theme: body.theme,
      enablePackaging: body.enablePackaging,
    });

    const slug = `generated/diff-${Date.now()}`;
    const outDir = resolve(process.cwd(), "hyperframes", slug);
    const bundle = await buildCodeStage(spec);
    writeCodeStageProject(outDir, spec, bundle);

    let duration = bundle.duration;
    let ttsWarning: string | undefined;
    if (body.withTts) {
      try {
        const ttsRes = await attachTtsToCodeStage(spec, outDir, body.speaker);
        duration = ttsRes.duration;
      } catch (err) {
        ttsWarning = err instanceof Error ? err.message : "配音合成失败，已保留无声版本";
      }
    }

    return NextResponse.json({
      slug,
      engine: "code-stage",
      duration,
      previewUrl: `/api/stage-preview/${slug}/index.html`,
      ttsWarning,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "参数错误" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Git Diff 解析生成失败" },
      { status: 400 },
    );
  }
}
