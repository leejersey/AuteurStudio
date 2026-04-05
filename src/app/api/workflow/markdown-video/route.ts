import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/volcengine-tts";
import { saveProject, createProjectFromVideoData } from "@/lib/project-store";
import type { VideoScript } from "@/lib/types/workflow";
import type { MarkdownSlide, CodeTheme, MarkdownVideoData } from "@/lib/types/markdown-video";

function estimateDurationMs(text: string): number {
  return Math.max(3000, Math.ceil((text.length / 4) * 1000) + 500);
}

/** POST /api/workflow/markdown-video — Markdown 视频数据生成 + TTS */
export async function POST(req: NextRequest) {
  try {
    const { script, markdownSlides, theme = "dracula", templateId } = (await req.json()) as {
      script: VideoScript;
      markdownSlides: MarkdownSlide[];
      theme: CodeTheme;
      templateId?: string;
    };

    if (!script || !markdownSlides || markdownSlides.length === 0) {
      return NextResponse.json(
        { error: "请提供 Markdown 脚本数据" },
        { status: 400 }
      );
    }

    // ─── Step 1: TTS 合成旁白 ───
    const narrations = script.slides.map((slide) => ({
      text: slide.narration,
      durationMs: undefined as number | undefined,
      audioUrl: undefined as string | undefined,
    }));

    console.log(`[MD-TTS] 开始为 ${narrations.length} 段旁白合成语音...`);
    let succeeded = 0;

    for (let i = 0; i < narrations.length; i++) {
      const seg = narrations[i];
      try {
        const { audioBuffer } = await synthesizeSpeech(seg.text);
        const base64 = audioBuffer.toString("base64");
        seg.audioUrl = `data:audio/mp3;base64,${base64}`;
        const estimatedSec = audioBuffer.length / 16000;
        seg.durationMs = Math.max(3000, Math.ceil(estimatedSec * 1000));
        succeeded++;
      } catch {
        seg.durationMs = estimateDurationMs(seg.text);
      }

      if (i < narrations.length - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    console.log(`[MD-TTS] 合成完成: ${succeeded}/${narrations.length} 成功`);

    // ─── Step 2: 构造 MarkdownVideoData ───
    // 确保 markdownSlides 的 narrationIndex 正确
    const processedSlides = markdownSlides.map((slide, i) => ({
      ...slide,
      narrationIndex: i,
    }));

    const videoData: MarkdownVideoData = {
      meta: {
        title: script.title,
        category: "技术教程",
        templateId: templateId || "dark-tech",
        aspectRatio: "16:9",
        codeTheme: theme,
      },
      slides: processedSlides,
      narration: narrations,
    };

    // ─── Step 3: 保存项目 ───
    const project = createProjectFromVideoData(
      videoData as unknown as Record<string, unknown>,
      "markdown",
      script.title
    );
    await saveProject(project);

    return NextResponse.json({
      videoData,
      videoType: "markdown",
      projectId: project.id,
    });
  } catch (error) {
    console.error("[/api/workflow/markdown-video] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "视频生成失败" },
      { status: 500 }
    );
  }
}
