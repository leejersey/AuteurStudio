import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStudioEnvStatus, readStudioSettings, writeStudioSettings } from "@/lib/stage-settings";

export const dynamic = "force-dynamic";
export type { StudioSettings } from "@/lib/stage-settings";

export async function GET() {
  return NextResponse.json({
    settings: readStudioSettings(),
    envStatus: getStudioEnvStatus(),
  });
}

export async function PUT(req: NextRequest) {
  try {
    const saved = writeStudioSettings(await req.json());
    return NextResponse.json({
      settings: saved,
      envStatus: getStudioEnvStatus(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "配置格式不正确", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "保存配置失败" }, { status: 500 });
  }
}
