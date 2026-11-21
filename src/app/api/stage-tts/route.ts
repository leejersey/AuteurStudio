import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { synthesizeTtsForProjectDir } from "@/lib/stage-tts";

const ttsReqSchema = z.object({
  slug: z.string().trim().min(1),
  speaker: z.string().trim().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { slug, speaker } = ttsReqSchema.parse(await req.json());
    const rootDir = resolve(process.cwd(), "hyperframes");
    const projectDir = resolve(rootDir, slug);
    const rel = relative(rootDir, projectDir);

    if (rel.startsWith("..") || !existsSync(join(projectDir, "spec.json"))) {
      return NextResponse.json({ error: "目标视频工程不存在" }, { status: 404 });
    }

    const result = await synthesizeTtsForProjectDir(projectDir, speaker);
    return NextResponse.json({
      slug,
      engine: result.engine,
      duration: result.duration,
      hasAudio: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "TTS 语音合成失败" },
      { status: 500 },
    );
  }
}
