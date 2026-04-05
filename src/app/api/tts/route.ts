import { NextRequest, NextResponse } from "next/server";
import {
  synthesizeSpeech,
  AVAILABLE_VOICES,
} from "@/lib/volcengine-tts";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "请提供有效的文本内容" },
        { status: 400 }
      );
    }

    const { audioBuffer } = await synthesizeSpeech(text, voiceId);

    // 将音频以 base64 返回（前端可以直接用 data URL 播放）
    const audioBase64 = audioBuffer.toString("base64");
    const mimeType = "audio/wav"; // mock 模式是 wav

    return NextResponse.json({
      audioUrl: `data:${mimeType};base64,${audioBase64}`,
      textLength: text.length,
      voiceId: voiceId || AVAILABLE_VOICES[0].id,
    });
  } catch (error) {
    console.error("[/api/tts] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "TTS 合成失败",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ voices: AVAILABLE_VOICES });
}
